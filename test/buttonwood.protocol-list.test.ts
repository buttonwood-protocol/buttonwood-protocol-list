import { getAddress } from '@ethersproject/address';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'chai';
import path from 'path';
import { ProtocolList } from '../dist';
import packageJson from '../package.json';
import protocolListSchema from '../protocol-list.schema.json';
import { loadJson } from '../src/utils/loadJson';
import { pathExists } from '../src/utils/pathExists';
import { getLocalPath } from './getLocalPath';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(protocolListSchema);

describe('buildList', () => {
  const protocolListPromise = loadJson<ProtocolList>(
    path.join('.', 'buttonwood.protocol-list.json'),
  );

  it('validates against schema', async () => {
    const protocolList = await protocolListPromise;
    const validates = validator(protocolList);
    if (!validates) {
      console.error(validator.errors);
    }
    expect(validates).to.equal(true);
  });

  it('contains no duplicate protocol names', async () => {
    const protocolList = await protocolListPromise;
    const map: Record<string, true> = {};
    for (const protocolInfo of protocolList.protocols) {
      const key = protocolInfo.name;
      expect(typeof map[key]).to.equal('undefined');
      map[key] = true;
    }
  });

  it('all addresses are valid and checksummed', async () => {
    const protocolList = await protocolListPromise;
    for (const protocolInfo of protocolList.protocols) {
      if (protocolInfo.overrides) {
        for (const address of Object.keys(protocolInfo.overrides)) {
          expect(address).to.eq(getAddress(address));
        }
      }
      for (const protocolChainInfo of Object.values(protocolInfo.chains)) {
        if (protocolChainInfo.auctionCreators) {
          for (const address of protocolChainInfo.auctionCreators) {
            expect(address).to.eq(getAddress(address));
          }
        }
        if (protocolChainInfo.bondCreators) {
          for (const address of protocolChainInfo.bondCreators) {
            expect(address).to.eq(getAddress(address));
          }
        }
      }
    }
  });

  it('no unused override addresses', async () => {
    const protocolList = await protocolListPromise;
    for (const protocolInfo of protocolList.protocols) {
      if (protocolInfo.overrides) {
        const addresses = new Set();
        for (const protocolChainInfo of Object.values(protocolInfo.chains)) {
          if (protocolChainInfo.auctionCreators) {
            for (const address of protocolChainInfo.auctionCreators) {
              addresses.add(address);
            }
          }
          if (protocolChainInfo.bondCreators) {
            for (const address of protocolChainInfo.bondCreators) {
              addresses.add(address);
            }
          }
        }
        for (const address of Object.keys(protocolInfo.overrides)) {
          expect(addresses.has(address)).to.eq(true);
        }
      }
    }
  });

  it('all local assets exist', async () => {
    const protocolList = await protocolListPromise;
    if (protocolList.logoURI) {
      const localPath = getLocalPath(protocolList.logoURI);
      if (localPath) {
        const exists = await pathExists(localPath);
        expect(exists).to.eq(true);
      }
    }
    for (const protocolInfo of protocolList.protocols) {
      if (protocolInfo.imageURI) {
        const localPath = getLocalPath(protocolInfo.imageURI);
        if (localPath) {
          const exists = await pathExists(localPath);
          expect(exists).to.eq(true);
        }
      }
      if (protocolInfo.overrides) {
        for (const { imageURI } of Object.values(protocolInfo.overrides)) {
          if (imageURI) {
            const localPath = getLocalPath(imageURI);
            if (localPath) {
              const exists = await pathExists(localPath);
              expect(exists).to.eq(true);
            }
          }
        }
      }
    }
  });

  it('version matches package.json', async () => {
    const protocolList = (await protocolListPromise) as ProtocolList;
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(
      `${protocolList.version.major}.${protocolList.version.minor}.${protocolList.version.patch}`,
    );
  });
});
