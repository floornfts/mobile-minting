import { Alchemy, Contract } from 'alchemy-sdk';
import { FOUNDATION_MINT_ABI } from './abi';
import { AlchemyMultichainClient } from 'src/lib/rpc/alchemy-multichain';
import { NETWORKS } from '../../../src/lib/simulation/simulation';

const getContract = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<Contract> => {
  const ethersProvider = await alchemy.forNetwork(NETWORKS[chainId]).config.getProvider();
  const contract = new Contract(contractAddress, FOUNDATION_MINT_ABI, ethersProvider);
  return contract;
};

export const getFoundationMintPriceInWei = async (
  chainId: number,
  contractAddress: string,
  dropAddress: string,
  alchemy: AlchemyMultichainClient,
  saleType: 'FIXED_PRICE_DROP' | string,
): Promise<string | undefined> => {
  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const saleData =
      saleType === 'FIXED_PRICE_DROP'
        ? await contract.functions.getFixedPriceSaleV2(dropAddress)
        : await contract.functions.getDutchAuctionV2(dropAddress);

    const tokenPrice = saleType === 'FIXED_PRICE_DROP' ? saleData.price : saleData.currentPrice;
    const totalFee = parseInt(tokenPrice.toString()) + parseInt(saleData.mintFeePerNftInWei.toString());

    return `${totalFee}`;
  } catch (error) {}
};
