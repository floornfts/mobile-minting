import { Alchemy, Contract } from 'alchemy-sdk';

import { BigNumber } from 'alchemy-sdk';
import { RODEO_ABI } from './abi';

const getContract = async (contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, RODEO_ABI, ethersProvider);
  return contract;
};

export const getRodeoFeeInEth = async (
  salesTermId: number,
  referrer: string,
  mintContractAddress: string,
  alchemy: Alchemy,
): Promise<string> => {
  const contract = await getContract(mintContractAddress, alchemy);
  const feeConfig = await contract.functions.getFixedPriceSale(salesTermId, referrer);

  // Destructure the results from the feeConfig
  // We're using the structure from the ABI you provided earlier
  const [results] = feeConfig;
  const {
    creatorRevenuePerQuantity,
    referrerRewardPerQuantity,
    worldCuratorRevenuePerQuantity,
    protocolFeePerQuantity,
    pricePerQuantity,
  } = results;

  // Sum up all the fees
  const totalFee = BigNumber.from(creatorRevenuePerQuantity)
    .add(referrerRewardPerQuantity)
    .add(worldCuratorRevenuePerQuantity)
    .add(protocolFeePerQuantity)
    .add(pricePerQuantity);

  return totalFee.toString();
};
