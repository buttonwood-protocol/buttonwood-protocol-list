import { CommonListParams, getCommonList } from './getCommonList';
import { ProtocolInfo, ProtocolList } from 'protocol-lists';

export function getProtocolList(
  commonParams: CommonListParams,
  protocols: ProtocolInfo[],
): ProtocolList {
  return {
    ...getCommonList(commonParams),
    protocols,
  };
}
