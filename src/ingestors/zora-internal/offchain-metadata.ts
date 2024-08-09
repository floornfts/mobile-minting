import { Alchemy, Contract } from 'alchemy-sdk';
import { ZORA_TIMED_MINT_ABI } from './abi';
import { ZoraSourceTranslator } from './zora-sources';
import { Axios } from 'axios';
import { ZoraTokenDetails } from './zora-types';
import { EVMMintInstructions } from 'src/lib';

export class ZoraMetadataProvider {
  getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
    const ethersProvider = await alchemy.config.getProvider();
    const contract = new Contract(contractAddress, ZORA_TIMED_MINT_ABI, ethersProvider);
    return contract;
  };

  getMetadataForToken = async (
    chainId: number,
    contractAddress: string,
    tokenId: string | undefined,
    fetcher: Axios,
  ): Promise<ZoraTokenDetails> => {
    const zoraSourceTranslator = new ZoraSourceTranslator();
    const chainName = zoraSourceTranslator.chainNameFromChainId(chainId);
    let zoraChain = `${chainName?.toUpperCase()}-MAINNET`;

    const tokenQueryParam = tokenId ? `?token_id=${tokenId}` : ``;

    const response = await fetcher.get(
      `https://api.zora.co/discover/contract/${zoraChain}/${contractAddress}${tokenQueryParam}`,
    );

    const tokenData = response.data as ZoraTokenDetails;
    if (!tokenData.collection.name) {
      throw new Error(`No collection found for token ${contractAddress}`);
    }

    return tokenData;
  };

  mintInstructionsForToken = async (tokenDetails: ZoraTokenDetails): Promise<EVMMintInstructions> => {
    const mintPrice = await this.mintPriceWeiForToken(tokenDetails);
    const chainName = tokenDetails.chain_name.split('-')[0].toLowerCase();
    const chainId = new ZoraSourceTranslator().chainIdFromChainName(chainName);

    if (!chainId) {
      throw new Error(`Unsupported chain: ${tokenDetails.chain_name}`);
    }

    const mintInstructions: EVMMintInstructions = {
      chainId: chainId,
      contractAddress: tokenDetails.mintable.mint_context.mint_contract_address,
      abi: ZORA_TIMED_MINT_ABI,
      contractMethod: 'mint',
      contractMethodArgs: [tokenDetails.mintable.mint_context.mint_token_id],
      mintPrice,
    };
  };

  mintPriceWeiForToken = async (tokenDetails: ZoraTokenDetails): Promise<string> => {
    const mintFeePerTokenWei = BigInt(tokenDetails.mintable.mint_context.mint_fee_per_token);
    const mintPriceWei = mintFeePerTokenWei * BigInt(tokenDetails.mintable.cost.eth_price.raw || '');
    return (mintFeePerTokenWei + mintPriceWei).toString();
  };
}
