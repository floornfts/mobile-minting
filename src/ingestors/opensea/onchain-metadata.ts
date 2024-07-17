import { Alchemy, Contract } from 'alchemy-sdk';
import { OPENSEA_DROPS_ABI, OPENSEA_PROXY_ABI } from './abi';
import axios from "axios";
import { openSeaOnchainDataFromUrl } from './offchain-metadata';

// Declare global constant for OpenSea Drops implementation contract address
// Proxy contracts which are the mint contracts will be defined as nftContract 
const CONTRACT_ADDRESS = "0x00005ea00ac477b1030ce78506496e8c2de24bf5";

// Get the contract from contractAddress 
const getContract = async (
  contractAddress: string, 
  abi: any, 
  alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, abi, ethersProvider);
  return contract;
};

export const getOpenSeaDropContractMetadata = async (
  chainId: number,
  nftContractAddress: string,
  alchemy: Alchemy,
): Promise<any> => {
  const contract = await getContract(CONTRACT_ADDRESS, OPENSEA_DROPS_ABI, alchemy);

  const url = await urlForValidOpenSeaDropContract(nftContractAddress, alchemy) || "";

  const { name, description, image, creatorName, creatorAddress, creatorWebsite, creatorTwitter } = await openSeaOnchainDataFromUrl(url, axios) || {};

  const metadata = await contract.functions.getPublicDrop(nftContractAddress);
  const {startTime, endTime} = metadata[0];

  return {
    name,
    description,
    image,
    startDate: new Date(startTime * 1000),
    endDate: new Date(endTime * 1000),
    creatorName,
    creatorAddress,
    creatorWebsite,
    creatorTwitter
  };
};

export const getOpenSeaDropPriceInEth = async (
  chainId: number,
  nftContract: string,
  alchemy: Alchemy,
): Promise<any> => {
  const contract = await getContract(CONTRACT_ADDRESS, OPENSEA_DROPS_ABI, alchemy);
  const metadata = await contract.functions.getPublicDrop(nftContract);

  const {mintPrice, feeBps} = metadata[0];

  // Convert basis points to decimal value
  const feeRatio = feeBps / 10000;

  // Calculate the fee amount
  const feePrice = feeRatio * mintPrice;

  const totalFee = parseInt(feePrice.toString()) + parseInt(mintPrice.toString());
  return `${totalFee}`;
};


// Function to get the URL for a valid OpenSea Drop contract
export const urlForValidOpenSeaDropContract = async (
  contractAddress: string,
  alchemy: Alchemy,
): Promise<any> => {
  try {
    // Get the contract
    const contract = await getContract(contractAddress, OPENSEA_PROXY_ABI, alchemy);
    if (!contract) {
      return undefined;
    }

    // Fetch the contract name
    let response;
    try {
      response = await contract.functions.name();
    } catch {
      return undefined;
    }

    // Clean and format the name for the URL
    const formattedName = response[0]
      .replace(/[^a-zA-Z0-9]+/g, "-") // Replace sequences of non-alphanumeric characters with a single hyphen
      .toLowerCase(); // Convert to lowercase

    // Construct the URL
    const url = `https://opensea.io/collection/${formattedName}/overview`;

    return url;
  } catch (error) {
    return undefined;
  }
};

