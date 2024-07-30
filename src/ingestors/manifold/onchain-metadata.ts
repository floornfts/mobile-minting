import { Alchemy, Contract } from 'alchemy-sdk';
import axios, { AxiosInstance } from 'axios';
import { MANIFOLD_CLAIMS_ABI } from './abi';

// fetch contract instance
const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, MANIFOLD_CLAIMS_ABI, ethersProvider);
  return contract;
};

// convert name into URL format
const convertNameToUrl = (name: string): string => {
  return `https://app.manifold.xyz/c/${name.toLowerCase().replace(/\s+/g, '')}`;
};

// fetch contract name and validate URL
export const urlForValidManifoldContract = async (
  chainId: number,
  contractAddress: string,
  alchemy: Alchemy,
  fetcher: AxiosInstance = axios,
): Promise<string | undefined> => {

  let name: string;
  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const response = await contract.functions.name();
    name = response[0];
  } catch (error) {
    return undefined;
  }

  if (!name || typeof name !== 'string') {
    throw new Error('Failed to fetch contract name');
  }

  const url = convertNameToUrl(name);

  try {
    const response = await fetcher.get(url);
    if (response.status !== 200) {
      return undefined;
    }
    return url;
  } catch (error) {
    console.error('Error validating URL:', error);
    return undefined;
  }
};

export const getManifoldMintPriceInEth = async (
  mintPrice: number
): Promise<any> => {
  // fee amount is standard
  const feePrice = 500000000000000;

  const totalFee = parseInt(feePrice.toString()) + parseInt(mintPrice.toString());
  return `${totalFee}`;
};

export const getManifoldMintOwner = async (
  chainId: number,
  contractAddress: string,
  alchemy: Alchemy,
): Promise<any> => {
  const contract = await getContract(chainId, contractAddress, alchemy);
  const response = await contract.functions.owner();
  const owner = response[0];
  
  return owner;
};
