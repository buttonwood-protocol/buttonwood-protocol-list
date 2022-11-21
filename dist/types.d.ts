import { TokenList } from '@uniswap/token-lists';
export type CommonList = Omit<TokenList, 'tokens'>;
export interface ProtocolAddressInfo {
    name: string;
    imageURI?: string;
    homepage?: string;
}
export interface ProtocolChainInfo {
    auctionCreators?: string[];
    bondCreators?: string[];
}
export interface ProtocolInfo extends ProtocolAddressInfo {
    chains: Record<number, ProtocolChainInfo>;
    overrides?: Record<string, Partial<ProtocolAddressInfo>>;
}
export interface ProtocolList extends CommonList {
    protocols: ProtocolInfo[];
}
