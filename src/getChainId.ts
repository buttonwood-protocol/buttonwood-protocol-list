export function getChainId(chainName: string): number {
    switch (chainName) {
        case 'mainnet':
            return 1;
        case 'goerli':
            return 5;
        default:
            throw new Error(`Unrecognised chainName: ${chainName}`);
    }
}
