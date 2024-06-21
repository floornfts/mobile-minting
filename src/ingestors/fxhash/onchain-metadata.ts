import { Alchemy, Contract } from 'alchemy-sdk';

const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy, abi: any): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, abi, ethersProvider);
  return contract;
};

export const getFxHashMintPriceInEth = async (
  chainId: number,
  contractAddress: string,
  dropAddress: string,
  reserveId: number,
  alchemy: Alchemy,
  abi: any,
): Promise<any> => {
  const contract = await getContract(chainId, contractAddress, alchemy, abi);
  const tokenPrice = await contract.functions.prices(dropAddress, reserveId);

  const totalPrice = parseInt(tokenPrice.toString());
  return `${totalPrice}`;
};
