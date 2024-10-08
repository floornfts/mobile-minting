import { Contract } from 'alchemy-sdk';
import { MINT_CONTRACT_ABI } from './abi';
import { CollectionMetadata } from './types';
import { AlchemyMultichainClient } from '../../../src/lib/rpc/alchemy-multichain';
import { NETWORKS } from '../../../src/lib/simulation/simulation';

const getContract = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<Contract> => {
  const ethersProvider = await alchemy.forNetwork(NETWORKS[chainId]).config.getProvider();
  const contract = new Contract(contractAddress, MINT_CONTRACT_ABI, ethersProvider);
  return contract;
};

export const getCoinbaseWalletMetadata = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<CollectionMetadata | undefined> => {
  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const metadata = await contract.functions.metadata();

    return {
      ...metadata,
      cost: parseInt(String(metadata.cost)),
      startTime: parseInt(String(metadata.startTime)),
      endTime: parseInt(String(metadata.endTime)),
    };
  } catch (error) {
    console.log(error);
  }
};

export const getCoinbaseWalletPriceInWei = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<string | undefined> => {
  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const price = await contract.functions.cost(1);

    return `${parseInt(String(price))}`;
  } catch (error) {
    console.log(error);
  }
};
