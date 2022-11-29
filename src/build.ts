import { Version } from '@uniswap/token-lists';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getNewVersion } from 'protocol-lists';
import packageJson from '../package.json';
import { getOldProtocolList } from './getOldProtocolList';
import { getProtocolList } from './getProtocolList';
import { getProtocols } from './getProtocols';

async function updatePackageJsonVersion(version: Version) {
  packageJson.version = `${version.major}.${version.minor}.${version.patch}`;
  await writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf8');
}

async function build(): Promise<void> {
  const protocols = await getProtocols();

  let protocolList = getProtocolList(
    {
      name: 'Buttonwood',
      keywords: ['buttonwood', 'defi'],
    },
    protocols,
  );

  const newVersion = getNewVersion(
    await getOldProtocolList(),
    // stringify & parse to flush any undefined or null values that will be lost by the time the new list
    //   has been written, but which cause unwanted diffs when calculating new version
    JSON.parse(JSON.stringify(protocolList)),
  );
  await updatePackageJsonVersion(newVersion);
  protocolList = { ...protocolList, version: newVersion };

  await writeFile(
    path.join('src', 'buttonwood.protocol-list.json'),
    JSON.stringify(protocolList, null, 2),
    'utf8',
  );
}

build().catch(console.error);
