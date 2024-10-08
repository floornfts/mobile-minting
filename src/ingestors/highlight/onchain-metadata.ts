import { Alchemy, Contract, Network } from 'alchemy-sdk';
import { MINT_CONTRACT_ABI } from './abi';
import { AlchemyMultichainClient } from 'src/lib/rpc/alchemy-multichain';

const CONTRACT_ADDRESS = '0x8087039152c472Fa74F47398628fF002994056EA';

const getContract = async (alchemy: AlchemyMultichainClient): Promise<Contract> => {
  const ethersProvider = await alchemy.forNetwork(Network.BASE_MAINNET).config.getProvider();
  const contract = new Contract(CONTRACT_ADDRESS, MINT_CONTRACT_ABI, ethersProvider);
  return contract;
};

export const getHighlightMintPriceInWei = async (
  vectorId: number,
  alchemy: AlchemyMultichainClient,
): Promise<string | undefined> => {
  try {
    const contract = await getContract(alchemy);
    const data = await contract.functions.getAbridgedVector(vectorId);
    const { pricePerToken } = data[0];

    const fee = 800000000000000;
    const totalFee = parseInt(pricePerToken.toString()) + fee;

    return `${totalFee}`;
  } catch (error) {
    console.log(error);
  }
};

export const getHighlightMetadata = async (
  vectorId: number,
  alchemy: AlchemyMultichainClient,
): Promise<{ startTimestamp: number; endTimestamp: number } | undefined> => {
  try {
    const contract = await getContract(alchemy);
    const metadata = await contract.functions.getAbridgedVector(vectorId);
    const { startTimestamp, endTimestamp } = metadata[0];
    return { startTimestamp, endTimestamp };
  } catch (error) {}
};
