import { ProtocolInfo, ProtocolList } from 'protocol-lists';
import { CommonListParams, getCommonList } from './getCommonList';

export function getProtocolList(
  commonParams: CommonListParams,
  protocols: ProtocolInfo[],
): ProtocolList {
  return {
    ...getCommonList(commonParams),
    protocols,
  };
}
