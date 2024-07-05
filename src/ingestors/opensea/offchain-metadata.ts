import { Axios } from "axios";

const ipfsGateway = 'https://ipfs.io/ipfs/'; // IPFS gateway URL (replace if needed)

export const openSeaOnchainDataFromIpfsUrl = async (baseuri: string, fetcher: Axios): Promise<{ name: string, description: string; image: string } | undefined> => {
    const ipfsHash = new URL(baseuri).href.split('/').slice(-1)[0];
    const url = `${ipfsGateway}${ipfsHash}`;

  try {
    const response = await fetcher.get(url);

    if (response.status !== 200) {
      return undefined;
    }

    const data = response.data;

    // Ensure data has the expected structure
    if (!data.hasOwnProperty('name') || !data.hasOwnProperty('description') || !data.hasOwnProperty('image')) {
      return undefined;
    }
    
    const imageHash = new URL(data.image).href.split('/').slice(-1)[0];

    return {
      name: data.name,
      description: data.description,
      image: `${ipfsGateway}${imageHash}`,
    };
  } catch (error) {
    return undefined;
  }
};
