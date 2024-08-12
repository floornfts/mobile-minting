import { Alchemy, Contract } from 'alchemy-sdk';
import { MINT_CONTRACT_ABI } from './abi';

const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, MINT_CONTRACT_ABI, ethersProvider);
  return contract;
};

type MintMetadata = {
  creator: string,
  name: string,
  description: string,
  image: string,
  mintType: 'OPEN_EDITION_721',
  cost: number,
  startTime: number,
  endTime: number,
}

export const getCoinbaseWalletMetadata = async (
  chainId: number,
  contractAddress: string,
  alchemy: Alchemy,
): Promise<MintMetadata | undefined> => {
  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const metadata = await contract.functions.metadata();

    return {
      ...metadata,
      cost: parseInt(String(metadata.cost)),
      startTime: parseInt(String(metadata.startTime)),
      endTime: parseInt(String(metadata.endTime))
    };
  } catch (error) {
    console.log(error)
  }
};

export const getCoinbaseWalletPriceInWei = async (
  chainId: number,
  contractAddress: string,
  alchemy: Alchemy,
): Promise<string | undefined> => {
  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const price = await contract.functions.cost(1);

    return `${parseInt(String(price))}`;
    
  } catch (error) {
    console.log(error)
  }
};

