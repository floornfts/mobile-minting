import { Axios } from "axios";
import dotenv from 'dotenv';

dotenv.config();

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

export const openSeaOnchainDataFromUrl = async (
  url: string, 
  fetcher: Axios
): Promise<any> => {
  // extract the collection slug from the URL
  const match = url.match(/collection\/([^\/]+)/);
  const slug = match ? match[1] : null;

  if (!slug) {
    return { undefined };
  }

  try {
    // call the OpenSea API endpoint
    const response = await fetcher.get(
      `https://api.opensea.io/api/v2/collections/${slug}`,
      {
        headers: {
          'x-api-key': OPENSEA_API_KEY as string,
        },
      }
    );
    const data = response.data;

    const contractAddress = data?.contracts?.[0]?.address;
    const chainId = 8453;
    const name = data?.name;
    const description = data?.description;
    const image = data?.image_url;
    const creatorName = data?.project_url 
      ? data.project_url.split('/').filter(Boolean).pop().split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()) 
      : '';
    const creatorAddress = data?.owner;
    const creatorWebsite = data?.project_url || "";
    const creatorTwitter = data?.twitter_username || "";

    if (!contractAddress || !contractAddress.startsWith('0x')) {
      return { undefined };
    }

    return { 
      chainId, 
      contractAddress,
      name,
      description,
      image,
      creatorName,
      creatorAddress,
      creatorWebsite,
      creatorTwitter
    };

  } catch (error) {
    return { undefined };
  }
};