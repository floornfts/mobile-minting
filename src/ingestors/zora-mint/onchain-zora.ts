import { Alchemy, Contract } from 'alchemy-sdk';
import { zoraMintAbi} from './abi';
import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";

export const getContract = async ( contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
  const ethersProvider = await alchemy.config.getProvider();
  const contract = new Contract(contractAddress, zoraMintAbi, ethersProvider);
  return contract;
};



export const getZoraContractMetadata = async (
  tokenId: number,
  contractAddress: string,
): Promise<any> => {

{
  const networkInfo = {
    network: ZDKNetwork.Base,
    chain: ZDKChain.BaseMainnet,
  }
  
  const API_ENDPOINT = "https://api.zora.co/graphql";
  const args = { 
              endPoint:API_ENDPOINT, 
              networks:[networkInfo], 
            } 
  
  const zdk = new ZDK(args) 
  const collection: any = await zdk.token({
    token: { address: contractAddress, tokenId:tokenId.toString() },
    includeFullDetails: true,
  });
  const { token: { tokenContract, mintInfo, ...restTokenDetails } } = collection.token;

  // console.log('Mint Info:', mintInfo);
  // console.log('Token Contract:', tokenContract);
  // console.log('Other Token Details:', restTokenDetails);
  const name = restTokenDetails.name;
  const description = restTokenDetails.description;
  const imageUrl = restTokenDetails.image.url;
  const chainId = tokenContract.chain;
  
  // Convert blockTimestamp to Date.now format
  const startAt = new Date(mintInfo.mintContext.blockTimestamp).getTime();

  return {
    name,
    description,
    imageUrl,
    chainId,
    startAt
  };
}
}

export const getZoraMintPriceInEth = async (
  chainId: number,
  contractAddress: string,
  alchemy: Alchemy,
): Promise<any> => {
  const contract = await getContract(contractAddress, alchemy);
  const feePrice = await contract.functions.mintFee()/(10**18);

  return `${feePrice}`;
}
