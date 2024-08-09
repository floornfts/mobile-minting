import { Axios } from 'axios';
import { MintContractOptions } from 'src/lib/types';

export class ZoraSourceTranslator {
  urlForZoraContract = async (contract: MintContractOptions, fetcher: Axios): Promise<string> => {
    let { chainId, contractAddress, tokenId, url } = contract;
    if (!url) {
      url = `https://zora.co/collect/${this.chainNameFromChainId(chainId)}:${contractAddress}${
        tokenId ? `/${tokenId}` : ''
      }`;
    }
    try {
      const response = await fetcher.get(url);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch Zora contract ${contractAddress} on chain ${chainId}`);
      }
      return url;
    } catch (error) {
      throw new Error(`Could not derive URL for Zora contract ${contractAddress} on chain ${chainId}`);
    }
  };

  tokenDetailsFromUrl = async (url: string): Promise<{ chainId: number; contractAddress: string; tokenId: string }> => {
    // https://zora.co/collect/zora:0x20479b19ca05e0b63875a65acf24d81cd0973331/1
    var tokenId = '1';
    const urlParts = new URL(url).pathname.split('/');
    if (urlParts.length > 2) {
      tokenId = urlParts.pop() || '1';
    }
    const chainContract = urlParts.pop();
    const chainName = chainContract?.split(':')[0];
    const chainId = this.chainIdFromChainName(chainName || '');
    const contractAddress = chainContract?.split(':')[1];

    if (!chainId || !contractAddress) {
      throw new Error('Invalid chain or contract address');
    }
    return { chainId, contractAddress, tokenId };
  };

  // map of chain names to chain ids
  chainIdMap = {
    zora: 7777777,
    base: 8453,
    ethereum: 1,
  };

  chainIdFromChainName = (chainName: string): number | undefined => {
    return this.chainIdMap[chainName as keyof typeof this.chainIdMap];
  };

  chainNameFromChainId = (chainId: number): string | undefined => {
    return Object.keys(this.chainIdMap).find((key) => this.chainIdMap[key as keyof typeof this.chainIdMap] === chainId);
  };
}
