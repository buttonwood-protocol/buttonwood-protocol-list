import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs/promises';
import path from 'path';
import { getAssetUri } from './getAssetUri';
import { getChainId } from './getChainId';
import protocolDefinitionSchema from './protocol-definition.schema.json';
import {
  ProtocolAddressInfo,
  ProtocolChainInfo,
  ProtocolInfo,
} from 'protocol-lists';
import { loadJson } from './utils/loadJson';

const protocolDefinitionsPath = './src/protocolDefinitions';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const protocolDefinitionValidator = ajv.compile(protocolDefinitionSchema);

interface ProtocolDefinition extends ProtocolAddressInfo {
  chains: Record<string, ProtocolChainInfo>;
  overrides?: Record<string, Partial<ProtocolAddressInfo>>;
}

function checkAndConvertLocalAssetPath(localPath: string): string {
  const match = localPath.match(/^assets\/(.+)/);
  if (match) {
    const [, subPath] = match;
    return getAssetUri(subPath);
  }
  return localPath;
}

function getInfoFromDefinition(
  protocolDefinition: ProtocolDefinition,
): ProtocolInfo {
  const { name, imageURI, homepage, chains, overrides } = protocolDefinition;
  const protocolInfo: ProtocolInfo = {
    name,
    imageURI: undefined,
    homepage,
    chains: {},
    overrides: undefined,
  };
  if (imageURI) {
    protocolInfo.imageURI = checkAndConvertLocalAssetPath(imageURI);
  }
  for (const chainName of Object.keys(chains)) {
    const chainId = getChainId(chainName);
    protocolInfo.chains[chainId] = chains[chainName];
  }
  if (overrides) {
    protocolInfo.overrides = {};
    for (const key of Object.keys(overrides)) {
      const overrideImageURI = overrides[key].imageURI;
      protocolInfo.overrides[key] = {
        ...overrides[key],
        imageURI: overrideImageURI
          ? checkAndConvertLocalAssetPath(overrideImageURI)
          : undefined,
      };
    }
  }
  return protocolInfo;
}

export async function getProtocols(): Promise<ProtocolInfo[]> {
  const protocolDefinitionFiles = await fs.readdir(protocolDefinitionsPath);
  const protocols: ProtocolInfo[] = [];

  for (const protocolDefinitionFile of protocolDefinitionFiles) {
    const protocolDefinitionPath = path.join(
      protocolDefinitionsPath,
      protocolDefinitionFile,
    );
    const protocolDefinition = await loadJson<ProtocolDefinition>(
      protocolDefinitionPath,
    );
    const validates = protocolDefinitionValidator(protocolDefinition);
    if (!validates) {
      console.error(`Failed to validate ${protocolDefinitionPath}`);
      throw protocolDefinitionValidator.errors;
    }
    protocols.push(getInfoFromDefinition(protocolDefinition));
  }

  return protocols;
}
