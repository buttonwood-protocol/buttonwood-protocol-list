import { ProtocolList } from 'protocol-lists';
import protocolListUntyped from './buttonwood.protocol-list.json';

const protocolList = protocolListUntyped as ProtocolList;

export {
  ProtocolList,
  ProtocolInfo,
  ProtocolAddressInfo,
  ProtocolChainInfo,
} from 'protocol-lists';
export { protocolList };
