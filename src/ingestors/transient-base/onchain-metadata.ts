import { Alchemy, Contract, Network } from 'alchemy-sdk';

import { TRANSIENT_BASE_ABI } from './abi';
import { AlchemyMultichainClient } from 'src/lib/rpc/alchemy-multichain';

const getContract = async (contractAddress: string, alchemy: AlchemyMultichainClient): Promise<Contract> => {
  const ethersProvider = await alchemy.forNetwork(Network.BASE_MAINNET).config.getProvider();
  const contract = new Contract(contractAddress, TRANSIENT_BASE_ABI, ethersProvider);
  return contract;
};

export const getTransientProtocolFeeInEth = async (
  chainId: number,
  mintContractAddress: string,
  alchemy: AlchemyMultichainClient,
) => {
  const contract = await getContract(mintContractAddress, alchemy);
  const protocolFee = await contract.functions.protocolFee();
  return `${protocolFee}`;
};
