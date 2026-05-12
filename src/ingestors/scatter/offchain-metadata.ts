import { MintContractOptions, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { ScatterCollection, ScatterInviteList, ScatterMintOption, ScatterMintResponse } from './types';

const SCATTER_API_URL = 'https://api.scatter.art/v1';
const SCATTER_TRPC_SEARCH_URL = 'https://www.scatter.art/api/trpc/search.searchCollections';
const BASE_RPC_URL = 'https://mainnet.base.org';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const TEST_MINTER_ADDRESS = '0x0000000000000000000000000000000000000001';
const MAX_UINT32 = 4294967295;
const MINT_SELECTOR = '0x4a21a2df';
const NAME_SELECTOR = '0x06fdde03';
const LIST_SUPPLY_SELECTOR = '0x9a7a973c';

export const SCATTER_ZERO_ADDRESS = ZERO_ADDRESS;

export const scatterUrlForSlug = (slug: string) => `https://www.scatter.art/collection/${slug}`;

export const scatterSlugFromUrl = (url: string): string | undefined => {
  const parsed = new URL(url);
  if (parsed.hostname !== 'www.scatter.art' && parsed.hostname !== 'scatter.art') {
    return;
  }

  const parts = parsed.pathname.split('/').filter(Boolean);
  const collectionIndex = parts.indexOf('collection');
  if (collectionIndex === -1) {
    return;
  }

  return parts[collectionIndex + 1];
};

export const getScatterCollectionBySlug = async (
  resources: MintIngestorResources,
  slug: string,
): Promise<ScatterCollection | undefined> => {
  try {
    const response = await resources.fetcher.get(`${SCATTER_API_URL}/collection/${slug}`);
    return {
      ...response.data,
      slug,
    };
  } catch (error) {
    return;
  }
};

export const getScatterInviteLists = async (
  resources: MintIngestorResources,
  slug: string,
): Promise<ScatterInviteList[]> => {
  try {
    const response = await resources.fetcher.get(`${SCATTER_API_URL}/collection/${slug}/eligible-invite-lists`);
    return response.data || [];
  } catch (error) {
    return [];
  }
};

export const getScatterMintResponse = async (
  resources: MintIngestorResources,
  collection: ScatterCollection,
  inviteList: ScatterInviteList,
): Promise<ScatterMintResponse | undefined> => {
  try {
    const response = await resources.fetcher.post(
      `${SCATTER_API_URL}/mint`,
      {
        collectionAddress: collection.address,
        chainId: collection.chain_id,
        minterAddress: TEST_MINTER_ADDRESS,
        lists: [{ id: inviteList.id, quantity: 1 }],
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    return;
  }
};

export const findScatterMintOption = async (
  resources: MintIngestorResources,
  collection: ScatterCollection,
): Promise<ScatterMintOption | undefined> => {
  if (!collection.slug) {
    return;
  }
  if (collection.max_items && collection.num_items && collection.num_items >= collection.max_items) {
    return;
  }

  const inviteLists = await getScatterInviteLists(resources, collection.slug);
  for (const inviteList of inviteLists) {
    if (!isNativePublicInviteList(inviteList) || !isInviteListActive(inviteList)) {
      continue;
    }

    const listLimit = inviteList.list_limit;
    if (listLimit !== null && listLimit !== undefined && listLimit !== MAX_UINT32) {
      if (listLimit <= 0) {
        continue;
      }

      const listSupply = await getListSupply(resources, collection.address, inviteList.root);
      if (listSupply !== undefined && listSupply >= BigInt(listLimit)) {
        continue;
      }
    }

    const mintResponse = await getScatterMintResponse(resources, collection, inviteList);
    if (!mintResponse || !isUsableMintResponse(collection, mintResponse)) {
      continue;
    }

    return {
      inviteList,
      mintResponse,
    };
  }

  return;
};

export const resolveScatterCollectionForContract = async (
  resources: MintIngestorResources,
  contractOptions: MintContractOptions,
): Promise<ScatterCollection | undefined> => {
  if (contractOptions.chainId !== 8453) {
    return;
  }

  if (contractOptions.url) {
    const slug = scatterSlugFromUrl(contractOptions.url);
    if (slug) {
      const collection = await getScatterCollectionBySlug(resources, slug);
      if (
        collection &&
        collection.chain_id === contractOptions.chainId &&
        sameAddress(collection.address, contractOptions.contractAddress)
      ) {
        return collection;
      }
    }
  }

  const contractName = await readBaseContractName(resources, contractOptions.contractAddress);
  if (!contractName) {
    return;
  }

  const searchResults = await searchScatterCollections(resources, contractName, contractOptions.chainId);
  const matchingCollection = searchResults.find((collection) =>
    sameAddress(collection.address, contractOptions.contractAddress),
  );
  if (!matchingCollection?.slug) {
    return;
  }

  return getScatterCollectionBySlug(resources, matchingCollection.slug);
};

const searchScatterCollections = async (
  resources: MintIngestorResources,
  query: string,
  chainId: number,
): Promise<ScatterCollection[]> => {
  try {
    const input = {
      0: {
        json: {
          sortCategory: 'mints',
          sortTimeFrame: 'all',
          sortDirection: 'desc',
          queryStr: query,
          chainsFilter: [chainId],
          limit: 24,
        },
      },
    };
    const response = await resources.fetcher.get(SCATTER_TRPC_SEARCH_URL, {
      params: {
        batch: '1',
        input: JSON.stringify(input),
      },
    });
    const collections = response.data?.[0]?.result?.data?.json?.collections;
    if (!Array.isArray(collections)) {
      return [];
    }

    return collections.filter(isScatterSearchCollection);
  } catch (error) {
    return [];
  }
};

const isScatterSearchCollection = (collection: unknown): collection is ScatterCollection => {
  if (!collection || typeof collection !== 'object') {
    return false;
  }

  const value = collection as Partial<Record<keyof ScatterCollection, unknown>>;
  return typeof value.slug === 'string' && typeof value.address === 'string';
};

const isNativePublicInviteList = (inviteList: ScatterInviteList) => {
  return (
    inviteList.currency_address.toLowerCase() === ZERO_ADDRESS &&
    inviteList.decimals === 18 &&
    (inviteList.unit_size ?? 1) === 1
  );
};

const isInviteListActive = (inviteList: ScatterInviteList) => {
  const now = new Date();
  if (inviteList.start_time && new Date(inviteList.start_time) > now) {
    return false;
  }
  if (inviteList.end_time && new Date(inviteList.end_time) <= now) {
    return false;
  }
  return true;
};

const isUsableMintResponse = (collection: ScatterCollection, response: ScatterMintResponse | undefined) => {
  if (!response?.mintTransaction) {
    return false;
  }
  if (!sameAddress(response.mintTransaction.to, collection.address)) {
    return false;
  }
  if (!response.mintTransaction.data.startsWith(MINT_SELECTOR)) {
    return false;
  }
  return !response.erc20s?.length;
};

const readBaseContractName = async (
  resources: MintIngestorResources,
  contractAddress: string,
): Promise<string | undefined> => {
  try {
    const response = await resources.fetcher.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: NAME_SELECTOR,
        },
        'latest',
      ],
    });
    return decodeAbiString(response.data?.result);
  } catch (error) {
    return;
  }
};

const getListSupply = async (
  resources: MintIngestorResources,
  contractAddress: string,
  root: string,
): Promise<bigint | undefined> => {
  try {
    const response = await resources.fetcher.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: `${LIST_SUPPLY_SELECTOR}${root.replace(/^0x/, '')}`,
        },
        'latest',
      ],
    });
    if (!response.data?.result) {
      return;
    }
    return BigInt(response.data.result);
  } catch (error) {
    return;
  }
};

const decodeAbiString = (hexValue: string | undefined): string | undefined => {
  if (!hexValue?.startsWith('0x')) {
    return;
  }

  const data = Buffer.from(hexValue.slice(2), 'hex');
  if (data.length < 64) {
    return;
  }

  const offset = Number(BigInt(`0x${data.subarray(0, 32).toString('hex')}`));
  const length = Number(BigInt(`0x${data.subarray(offset, offset + 32).toString('hex')}`));
  return data.subarray(offset + 32, offset + 32 + length).toString('utf8');
};

const sameAddress = (a: unknown, b: unknown) => {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
};
