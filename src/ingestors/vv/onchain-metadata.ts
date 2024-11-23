import { Alchemy, AlchemyProvider, Contract } from 'alchemy-sdk';
import { MINT_CONTRACT_ABI } from './abi';

const CONTRACT_ADDRESS = '0x8087039152c472Fa74F47398628fF002994056EA';

const getContract = async (
  alchemy: Alchemy,
  contractAddress: string,
): Promise<{ contract: Contract; provider: AlchemyProvider }> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, MINT_CONTRACT_ABI, ethersProvider);
  return {
    contract,
    provider: ethersProvider,
  };
};

export const getVvMintPriceInWei = async (
  alchemy: Alchemy,
  contractAddress: string,
  blockNumber: number,
): Promise<string | undefined> => {
  try {
    const { provider } = await getContract(alchemy, contractAddress);
    const block = await provider.getBlock(blockNumber);

    const baseFeePerGas = block.baseFeePerGas;
    if (!baseFeePerGas) {
      throw new Error('Unable to fetch baseFee');
    }

    return `${+baseFeePerGas * 60000}`;
  } catch (error) {}
};

export const getVvLatestTokenId = async (alchemy: Alchemy, contractAddress: string): Promise<number | undefined> => {
  try {
    const { contract } = await getContract(alchemy, contractAddress);
    const tokenId = await contract.functions.latestTokenId();
    return +tokenId;
  } catch (error) {}
};

export const getVvCollection = async (alchemy: Alchemy, contractAddress: string, vectorId?: number) => {
  try {
    const { contract } = await getContract(alchemy, contractAddress);
    const collection = await contract.functions.get(vectorId ?? (await getVvLatestTokenId(alchemy, contractAddress)));
    const { name, description, artifact, renderer, mintedBlock, closeAt, data } = collection;
    return { name, description, artifact, renderer, mintedBlock, closeAt, data };
  } catch (error) {}
};

export const getVvCollectionMetadata = async (alchemy: Alchemy, contractAddress: string, vectorId?: number) => {
  try {
    const { contract } = await getContract(alchemy, contractAddress);
    const uri = await contract.functions.contractURI();
    const rawContent = uri[0].split(',')[1];
    let jsonString = atob(rawContent);
    const { name, symbol, description, image: imageBase64 } = JSON.parse(jsonString);
    const rawImage = imageBase64.split(',')[1];
    const image = atob(rawImage);

    return { name, symbol, description, image };
  } catch (error) {}
};

export const getVvCollectionCreator = async (alchemy: Alchemy, contractAddress: string) => {
  try {
    const { contract, provider } = await getContract(alchemy, contractAddress);
    const owner = await contract.functions.owner();
    const name = await provider.lookupAddress(owner[0]);
    return {
      creator: owner[0],
      name,
    };
  } catch (error) {}
};
