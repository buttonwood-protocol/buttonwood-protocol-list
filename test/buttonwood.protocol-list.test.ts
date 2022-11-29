import { getAddress } from '@ethersproject/address';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'chai';
import { getNewVersion, schema } from 'protocol-lists';
import packageJson from '../package.json';
import { protocolList } from '../src';
import { getOldProtocolList } from '../src/getOldProtocolList';
import { pathExists } from '../src/utils/pathExists';
import { getLocalPath } from './getLocalPath';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildList', () => {
  it('validates against schema', async () => {
    const validates = validator(protocolList);
    if (!validates) {
      console.error(validator.errors);
    }
    expect(validates).to.equal(true);
  });

  it('contains no duplicate protocol names', async () => {
    const map: Record<string, true> = {};
    for (const protocolInfo of protocolList.protocols) {
      const key = protocolInfo.name;
      expect(typeof map[key]).to.equal('undefined');
      map[key] = true;
    }
  });

  it('all addresses are valid and checksummed', async () => {
    for (const protocolInfo of protocolList.protocols) {
      if (protocolInfo.overrides) {
        for (const address of Object.keys(protocolInfo.overrides)) {
          expect(address).to.eq(getAddress(address));
        }
      }
      for (const protocolChainInfo of Object.values(protocolInfo.chains)) {
        if (protocolChainInfo) {
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
    }
  });

  it('no unused override addresses', async () => {
    for (const protocolInfo of protocolList.protocols) {
      if (protocolInfo.overrides) {
        const addresses = new Set();
        for (const protocolChainInfo of Object.values(protocolInfo.chains)) {
          if (protocolChainInfo) {
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
        }
        for (const address of Object.keys(protocolInfo.overrides)) {
          expect(addresses.has(address)).to.eq(true);
        }
      }
    }
  });

  it('all local assets exist', async () => {
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
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(
      `${protocolList.version.major}.${protocolList.version.minor}.${protocolList.version.patch}`,
    );
  });

  it('version is correctly upgraded', async () => {
    const newVersion = getNewVersion(
      await getOldProtocolList(),
      // stringify & parse to flush any undefined or null values that will be lost by the time the new list
      //   has been written, but which cause unwanted diffs when calculating new version
      JSON.parse(JSON.stringify(protocolList)),
    );
    expect(protocolList.version).to.deep.equal(newVersion);
  });
});
