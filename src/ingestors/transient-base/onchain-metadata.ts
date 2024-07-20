import { Alchemy, Contract } from 'alchemy-sdk';

import { TRANSIENT_BASE_ABI } from './abi';

const getContract = async (contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, TRANSIENT_BASE_ABI, ethersProvider);
  return contract;
};

export const getTransientProtocolFeeInEth = async (chainId: number, mintContractAddress: string, alchemy: Alchemy) => {
  const contract = await getContract(mintContractAddress, alchemy);
  const protocolFee = await contract.functions.protocolFee();
  return `${protocolFee}`;
};
