import { Alchemy, Contract } from 'alchemy-sdk';
import { OPENSEA_ABI } from './abi';

const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, OPENSEA_ABI, ethersProvider);
  return contract;
};

export const getProhibitionContractMetadata = async (
  chainId: number,
  contractAddress: string,
  dropAddress: string,
  alchemy: Alchemy,
): Promise<any> => {
  const contract = await getContract(chainId, contractAddress, alchemy);
  const metadata = await contract.functions.getPublicDrop(dropAddress);

  return metadata[0];
};

export const getOpenSeaMintPriceInEth = async (
  chainId: number,
  contractAddress: string,
  dropAddress: string,
  alchemy: Alchemy,
): Promise<any> => {

  const {mintPrice, feeBps} = await getProhibitionContractMetadata(chainId, contractAddress, dropAddress, alchemy);
  
  const feePrice = feeBps / 10000 * mintPrice;
  const totalFee = parseInt(feePrice.toString()) + parseInt(mintPrice.toString());

  return `${totalFee}`;
};
