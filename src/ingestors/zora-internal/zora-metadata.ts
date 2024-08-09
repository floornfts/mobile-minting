import { Alchemy, Contract } from 'alchemy-sdk';
import { ZORA_FIXED_PRICE_ABI, ZORA_TIMED_MINT_ABI } from './abi';
import { ZoraSourceTranslator } from './zora-sources';
import { Axios } from 'axios';
import { ZoraTokenDetails } from './zora-types';
import { EVMMintInstructions } from 'src/lib';

const FLOOR_REFERRER_REWARDS_ADDRESS = '0xBcaf781ddD26054AF684fb8785c8410EDddCC98a'.toLowerCase();
const ZORA_FIXED_PRICE_STRATEGY_ADDRESS = '0x04e2516a2c207e84a1839755675dfd8ef6302f0a';
const ZORA_TIMED_MINT_STRATEGY_ADDRESS = '0x777777722D078c97c6ad07d9f36801e653E356Ae';
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

  availabilityDatesForToken = async (
    tokenDetails: ZoraTokenDetails,
  ): Promise<{ startDate: Date; endDate: Date; liveDate: Date }> => {
    let startDate = new Date();
    let endDate = new Date('2030-01-01');

    let startDateISO8601 = tokenDetails.mintable?.start_datetime;
    let endDateISO8601 = tokenDetails.mintable?.end_datetime;

    if (startDateISO8601) {
      startDate = new Date(startDateISO8601);
    }
    if (endDateISO8601) {
      endDate = new Date(endDateISO8601);
    }

    let fallbackStartDateValue =
      tokenDetails.mintable?.mint_context.sale_strategies[0].fixed_price?.sale_start ||
      tokenDetails.mintable?.mint_context.sale_strategies[0].zora_timed_minter?.sale_start;
    if (fallbackStartDateValue) {
      startDate = new Date(parseInt(fallbackStartDateValue) * 1000);
    }

    let fallbackEndDateValue =
      tokenDetails.mintable?.mint_context.sale_strategies[0].fixed_price?.sale_end ||
      tokenDetails.mintable?.mint_context.sale_strategies[0].zora_timed_minter?.sale_end;
    if (fallbackEndDateValue) {
      endDate = new Date(parseInt(fallbackEndDateValue) * 1000);
    }

    let liveDate = startDate > new Date() ? startDate : new Date();

    return { startDate, endDate, liveDate };
  };

  mintInstructionsForToken = async (tokenDetails: ZoraTokenDetails): Promise<EVMMintInstructions> => {
    const chainName = tokenDetails.chain_name.split('-')[0].toLowerCase();
    const chainId = new ZoraSourceTranslator().chainIdFromChainName(chainName);

    if (!chainId) {
      throw new Error(`Unsupported chain: ${tokenDetails.chain_name}`);
    }

    const { address, method, params, abi, priceWei, tokenId } = await this._contractAddressMethodAndParams(
      tokenDetails,
    );

    const mintInstructions: EVMMintInstructions = {
      chainId: chainId,
      contractAddress: address,
      abi: abi,
      contractMethod: method,
      contractParams: params,
      priceWei: priceWei,
      tokenId: parseInt(tokenId || '1'),
    };

    return mintInstructions;
  };

  _mintPriceWeiForToken = async (tokenDetails: ZoraTokenDetails): Promise<string> => {
    const mintFeePerTokenString = tokenDetails.mintable?.mint_context?.mint_fee_per_token;
    if (!mintFeePerTokenString) {
      throw new Error(`No mint fee per token for token`);
    }
    const mintFeePerTokenWei = BigInt(mintFeePerTokenString);
    const mintPriceWei = BigInt(tokenDetails.mintable?.cost?.eth_price?.raw || '0');
    return (mintFeePerTokenWei + mintPriceWei).toString();
  };

  _contractAddressMethodAndParams = async (
    tokenDetails: ZoraTokenDetails,
  ): Promise<{
    address: string;
    method: string;
    params: string;
    abi: any;
    priceWei: string;
    tokenId: string | null;
  }> => {
    const mintType = tokenDetails.mintable?.mint_context?.sale_strategies[0].sale_strategies_type;
    const tokenId = tokenDetails.token_id;

    var contractAddress = '';
    var method = '';
    var params = '';
    var abi: any = [];
    var quantity = 1;
    var priceWei = '';

    const mintPrice = await this._mintPriceWeiForToken(tokenDetails);

    if (mintType === 'ZORA_TIMED') {
      // if the price is 0 then default to minting 11
      if (tokenDetails.mintable?.cost?.eth_price?.raw === '0') {
        quantity = 11;
        priceWei = (BigInt(mintPrice) * BigInt(quantity)).toString();
      }
      //mint(address mintTo, uint256 quantity, address collection, uint256 tokenId, address mintReferral, string comment)
      params = `[address, ${quantity}, "${tokenDetails.collection.address}", tokenId, "${FLOOR_REFERRER_REWARDS_ADDRESS}", "Minted on floor.fun"]`;
      contractAddress = ZORA_TIMED_MINT_STRATEGY_ADDRESS;
      method = 'mint';
      abi = ZORA_TIMED_MINT_ABI;
    } else if (mintType === 'FIXED_PRICE') {
      priceWei = mintPrice;
      abi = ZORA_FIXED_PRICE_ABI;
      contractAddress = tokenDetails.collection.address;
      method = 'mint';
      params = `["${ZORA_FIXED_PRICE_STRATEGY_ADDRESS}", tokenId, ${quantity}, ["${FLOOR_REFERRER_REWARDS_ADDRESS}"], encodedAddress]`;
    }

    return { address: contractAddress, method: method, params: params, abi: abi, priceWei: priceWei, tokenId: tokenId };
  };
}
