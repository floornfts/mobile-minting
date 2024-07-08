import { Alchemy, Contract } from 'alchemy-sdk';
import { MANIFOLD_CLAIMS_ABI } from './abi';

const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, MANIFOLD_CLAIMS_ABI, ethersProvider);
  return contract;
};

export const getManifoldMintPriceInEth = async (
  chainId: number,
  contractAddress: string,
  mintPrice: number,
  alchemy: Alchemy,
): Promise<any> => {
  const contract = await getContract(chainId, contractAddress, alchemy);
  const feeBps = await contract.functions.getFeeBps(1);
  
  // Convert basis points to decimal value
  const feeRatio = feeBps / 10000;

  // Calculate the fee amount
  const feePrice = feeRatio * mintPrice;

  const totalFee = parseInt(feePrice.toString()) + parseInt(mintPrice.toString());
  return `${totalFee}`;
};
