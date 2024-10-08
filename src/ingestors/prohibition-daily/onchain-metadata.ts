import { Contract } from 'alchemy-sdk';
import { PROHIBITION_DAILY_ABI } from './abi';
import { AlchemyMultichainClient } from '../../../src/lib/rpc/alchemy-multichain';
import { NETWORKS } from '../../../src/lib/simulation/simulation';

const getContract = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<Contract> => {
  const ethersProvider = await alchemy.forNetwork(NETWORKS[chainId]).config.getProvider();
  const contract = new Contract(contractAddress, PROHIBITION_DAILY_ABI, ethersProvider);
  return contract;
};

export const getProhibitionContractMetadata = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<any> => {
  const contract = await getContract(chainId, contractAddress, alchemy);
  const metadata = await contract.functions.contractURI();

  const startDateEpoch = await contract.functions.saleStart();
  const endDateEpoch = await contract.functions.saleEnd();

  const decoded = atob(metadata[0].split(',')[1]);
  const json = JSON.parse(decoded);

  return {
    ...json,
    startDate: new Date(startDateEpoch * 1000),
    endDate: new Date(endDateEpoch * 1000),
  };
};

export const getProhibitionMintPriceInEth = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<any> => {
  const contract = await getContract(chainId, contractAddress, alchemy);
  const feePrice = await contract.functions.mintFee(1);
  const tokenPrice = await contract.functions.tokenPrice();

  const totalFee = parseInt(feePrice.toString()) + parseInt(tokenPrice.toString());
  return `${totalFee}`;
};
