import { AxiosInstance, AxiosResponse } from 'axios';
import { MintContractOptions, MintIngestionErrorName, MintIngestorError, MintIngestorResources } from '../../lib';

/**
 * @param resources MintIngestorResources
 * @param url string ie 'https://www.transient.xyz/stacks/kansas-smile'
 * @returns  { chainId: number, contractAddress: string, image: string , name: string}
 * @throws MintIngestorError
 */
export const getTransientBaseMintByURL = async (
  resources: MintIngestorResources,
  url: string,
): Promise<{
  chainId: number;
  contractAddress: string;
  image: string;
  name: string;
  mintAddress: string;
  priceInWei: string;
  description: string;
}> => {
  // https://www.transient.xyz/stacks/kansas-smile
  const urlParts = url.split('/');
  const slug = urlParts.pop();
  if (!slug) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }
  return await getTransientBaseMintBySlug(resources, slug);
};

export const getTransientBaseMintBySlug = async (
  resources: MintIngestorResources,
  slug: string,
): Promise<{
  chainId: number;
  contractAddress: string;
  image: string;
  name: string;
  mintAddress: string;
  priceInWei: string;
  description: string;
  public_sale_start_at: string;
  public_sale_end_at: string;
  token_id: number;
  user: {
    name: string;
    image: string;
    website: string;
  }
}> => {
  // search Transient API for the slug
  let response: AxiosResponse;
  try {
    response = await resources.fetcher.get(`https://api.transient.xyz/v1/catalog/stacks/${slug}?format=json`);
  } catch (error) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }

  const data = response.data;
  if (!data || !data.nft_token) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }

  const { nft_contract, nft_token } = data;

  return {
    chainId: nft_contract.address.chain,
    contractAddress: nft_contract.address.raw_address,
    image: nft_token.image_uri,
    name: nft_token.name,
    priceInWei: data.current_cost,
    mintAddress: data.stacks_address.raw_address,
    description: data.description,
    public_sale_start_at: data.public_sale_start_at,
    public_sale_end_at: data.public_sale_end_at,
    token_id: data.nft_token.token_id,
    user: {
      name: data.nft_contract.user.display_name,
      image: data.nft_contract.user.pfp,
      website: `https://www.transient.xyz${data.nft_contract.user.uri}`,
    },
  };
};

export const getTransientBaseMintByAddressAndChain = async (
  resources: MintIngestorResources,
  chainId: number,
  contractAddress: string,
) => {
  let response: AxiosResponse;
  try {
    response = await resources.fetcher.get(
      `https://api.transient.xyz/v1/catalog/nfts?chain=${chainId}&address=${contractAddress}&format=json`,
    );
  } catch (error) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Could not query mint from Transient API');
  }

  const data = response.data;
  if (!data || !data.results.length) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
  }

  const token = data.results.find((token: any) => token.nft_contract.address.raw_address === contractAddress);
  if (!token) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
  }

  const slug = token.name.toLocaleLowerCase().split(' ').join('-');

  return await getTransientBaseMintBySlug(resources, slug);
};

export const transientSupports = async (contract: MintContractOptions, fetcher: AxiosInstance): Promise<boolean> => {
  const { chainId, contractAddress } = contract;
  let response: AxiosResponse;
  try {
    response = await fetcher.get(`https://api.transient.xyz/v1/catalog/nfts?chain=${chainId}&format=json`);
  } catch (error) {
    return false;
  }

  const data = response.data;
  if (!data || !data.results.length) {
    return false;
  }

  const tokens = data.results
    .filter((token: any) => token.nft_contract.address.raw_address === contractAddress)
    // filter by tokenId if set
    .filter((token: any) => !contract.tokenId || token.token_id === contract.tokenId)
    // now if url was set, check for slug match
    .filter(
      (token: any) =>
        !contract.url ||
        token.name.toLocaleLowerCase() === contract.url.split('/').pop()?.split('-').join(' ').toLocaleLowerCase(),
    );

  if (!tokens.length) {
    return false;
  }

  return true;
};
