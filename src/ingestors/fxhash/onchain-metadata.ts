import { Alchemy, Contract } from 'alchemy-sdk';

const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy, abi: any): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, abi, ethersProvider);
  return contract;
};