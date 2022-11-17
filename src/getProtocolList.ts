import { CommonListParams, getCommonList } from './getCommonList';
import { ProtocolInfo, ProtocolList } from './types';

export function getProtocolList(
  commonParams: CommonListParams,
  protocols: ProtocolInfo[],
): ProtocolList {
  return {
    ...getCommonList(commonParams),
    protocols,
  };
}
