import { ProtocolList } from 'protocol-lists';
import { getFileFromGit } from './getFileFromGit';

export async function getOldProtocolList(): Promise<ProtocolList> {
  const oldProtocolListText = await getFileFromGit(
    'origin/main',
    'src/buttonwood.protocol-list.json',
  );
  const oldProtocolList: ProtocolList = JSON.parse(oldProtocolListText);
  return oldProtocolList;
}
