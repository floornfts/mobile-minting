import { AxiosInstance, AxiosResponse } from 'axios';
import { MintContractOptions, MintIngestionErrorName, MintIngestorError, MintIngestorResources } from '../../lib';
interface NFTContractVersion {
  major: number;
  minor: number;
  patch: number;
}

interface NFTContractAddress {
  raw_address: string;
  chain: string;
  ecosystem: string;
}

interface NFTContractUser {
  id: number;
  username: string;
  display_name: string;
  pfp: string;
  uri: string;
  joined_at: string;
  updated_at: string;
}

interface NFTContract {
  name: string;
  symbol: string;
  contract_type: string;
  version: NFTContractVersion;
  uri: string;
  address: NFTContractAddress;
  user: NFTContractUser;
  created_at: string;
  updated_at: string;
}

interface NFT {
  id: number;
  token_id: number;
  name: string;
  uri: string;
  image_uri: string;
  is_valid: boolean;
  nft_contract: NFTContract;
  created_at: string;
  updated_at: string;
}

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
  token_id?: number;
  contract_type: string;
  user: {
    name: string;
    image: string;
    website: string;
  };
}> => {
  // search Transient API for the slug
  let response: AxiosResponse;
  try {
    response = await resources.fetcher.get(`https://api.transient.xyz/v1/catalog/stacks/${slug}?format=json`);
  } catch (error) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }

  const data = response.data;
  if (!data || !data.nft_contract) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }

  const { nft_contract, media_url, name } = data;

  return {
    chainId: nft_contract.address.chain,
    contractAddress: nft_contract.address.raw_address,
    image: media_url,
    name,
    priceInWei: data.current_cost,
    mintAddress: data.stacks_address.raw_address,
    description: data.description,
    public_sale_start_at: data.public_sale_start_at,
    public_sale_end_at: data.public_sale_end_at,
    token_id: data.nft_token?.token_id as number | undefined,
    contract_type: nft_contract.contract_type,
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
      `https://api.transient.xyz/v1/catalog/stacks?chain=${chainId}&address=${contractAddress}&format=json`,
    );
  } catch (error) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Could not query mint from Transient API');
  }

  const data = response.data;
  if (!data || !data.results.length) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
  }

  const token = data.results.find(
    (token: NFT) =>
      token.nft_contract.address.raw_address === contractAddress &&
      token.nft_contract.address.chain == chainId.toString(),
  );

  if (!token) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
  }

  const slug = token.slug;

  return await getTransientBaseMintBySlug(resources, slug);
};

export const transientSupports = async (
  contract: MintContractOptions,
  resources: MintIngestorResources,
): Promise<boolean> => {
  const { chainId, contractAddress, tokenId } = contract;
  const { fetcher } = resources;
  if (!tokenId) {
    try {
      const exists = await getTransientBaseMintByAddressAndChain(resources, chainId, contractAddress);
      return !!exists;
    } catch (error) {
      return false;
    }
  }

  const _tokens = await getTransientTokensForAddress(fetcher, chainId, contractAddress);

  const tokens = _tokens
    .filter((token) => token.nft_contract.address.raw_address === contractAddress)
    // filter by tokenId if set
    .filter((token) => !contract.tokenId || token.token_id.toString() == contract.tokenId)
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

const getTransientTokensForAddress = async (fetcher: AxiosInstance, chainId: number, contractAddress: string) => {
  let response: AxiosResponse;
  try {
    response = await fetcher.get(
      `https://api.transient.xyz/v1/catalog/nfts?chainId=${chainId}&address=${contractAddress}`,
    );
  } catch (error) {
    return [];
  }

  const data = response.data;
  if (!data || !data.results.length) {
    return [];
  }

  return data.results as NFT[];
};
