import { MintContractOptions, MintIngestorResources } from 'src/lib';
import { Collection, CollectionByAddress, HighlightMintVector } from './types';

const HIGHLIGHT_API_URL = 'https://api.highlight.xyz:8080/';
const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SUPPORTED_HIGHLIGHT_CHAIN_IDS = new Set([1, 8453]);
const HIGHLIGHT_CHAIN_ID_BY_PREFIX: Record<string, number> = {
  eth: 1,
  ethereum: 1,
  base: 8453,
};
const HIGHLIGHT_CHAIN_PREFIX_BY_ID: Record<number, string> = {
  1: 'ethereum',
  8453: 'base',
};

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
};

const getHighlightCollectionDetails = async (
  resources: MintIngestorResources,
  collectionId: string,
): Promise<Collection | undefined> => {
  const data = {
    operationName: 'GetCollectionDetails',
    variables: {
      collectionId,
      withEns: true,
    },
    query: `
      query GetCollectionDetails($collectionId: String!, $withEns: Boolean) {
        getPublicCollectionDetails(collectionId: $collectionId) {
          id
          name
          description
          collectionImage
          marketplaceId
          accountId
          address
          chainId
          status
          baseUri
          onChainBaseUri
          creatorAddresses {
            address
            name
          }
          creatorEns
          creatorAccountSettings(withEns: $withEns) {
            verified
            imported
            displayAvatar
            displayName
            walletAddresses
          }
          mintVectors {
            name
            start
            end
            paused
            price
            currency
            chainId
            onchainMintVectorId
            paymentCurrency {
              address
              decimals
              symbol
              type
              mintFee
            }
          }
        }
      }
    `,
  };

  try {
    const resp = await resources.fetcher.post(HIGHLIGHT_API_URL, data, { headers });
    return resp.data.data?.getPublicCollectionDetails;
  } catch (error) {}
};

const vectorIdFromOnchainId = (onchainMintVectorId: string | null): string | undefined => {
  if (!onchainMintVectorId) {
    return undefined;
  }
  const vectorId = onchainMintVectorId.split(':').pop();
  if (!vectorId || !/^\d+$/.test(vectorId)) {
    return undefined;
  }
  return vectorId;
};

const mintContractAddressFromOnchainId = (onchainMintVectorId: string | null): string | undefined => {
  const mintContractAddress = onchainMintVectorId?.split(':')[1];
  if (!mintContractAddress || !EVM_ADDRESS_REGEX.test(mintContractAddress)) {
    return undefined;
  }
  return mintContractAddress;
};

export const isSupportedHighlightChain = (chainId: number): boolean => {
  return SUPPORTED_HIGHLIGHT_CHAIN_IDS.has(chainId);
};

export const normalizeHighlightOnChainCollectionId = (id: string): string | undefined => {
  const [chain, contractAddress, editionId = '0'] = id.split(':');
  if (!chain || !contractAddress || id.split(':').length > 3) {
    return undefined;
  }

  const chainId = /^\d+$/.test(chain) ? Number(chain) : HIGHLIGHT_CHAIN_ID_BY_PREFIX[chain.toLowerCase()];
  if (!chainId || !isSupportedHighlightChain(chainId) || !EVM_ADDRESS_REGEX.test(contractAddress)) {
    return undefined;
  }

  return `${chainId}:${contractAddress}:${editionId || '0'}`;
};

export const getHighlightCollectionIdByOnChainId = async (
  resources: MintIngestorResources,
  onChainId: string,
): Promise<string | undefined> => {
  const data = {
    operationName: 'GetCollectionByOnChainId',
    variables: {
      onChainId,
    },
    query: `
      query GetCollectionByOnChainId($onChainId: String!) {
        getCollectionByOnChainId(onChainId: $onChainId) {
          id
          name
        }
      }
    `,
  };

  try {
    const resp = await resources.fetcher.post(HIGHLIGHT_API_URL, data, { headers });
    return resp.data.data?.getCollectionByOnChainId?.id;
  } catch (error) {}
};

export const getHighlightPrimaryMintVector = (
  collection: Collection,
  chainId: number = collection.chainId,
): HighlightMintVector | undefined => {
  return collection.mintVectors?.find(
    (vector) =>
      vector.chainId === chainId &&
      !vector.paused &&
      vector.currency.toLowerCase() === NATIVE_ETH_ADDRESS &&
      !!mintContractAddressFromOnchainId(vector.onchainMintVectorId) &&
      !!vectorIdFromOnchainId(vector.onchainMintVectorId),
  );
};

export const getHighlightMintVectorId = (vector: HighlightMintVector): string | undefined => {
  return vectorIdFromOnchainId(vector.onchainMintVectorId);
};

export const getHighlightMintContractAddress = (vector: HighlightMintVector): string | undefined => {
  return mintContractAddressFromOnchainId(vector.onchainMintVectorId);
};

export const highlightEthToWei = (amount: string | undefined | null): bigint | undefined => {
  if (amount === undefined || amount === null) {
    return undefined;
  }

  const normalizedAmount = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(normalizedAmount)) {
    return undefined;
  }

  const [wholePart, fractionalPart = ''] = normalizedAmount.split('.');
  const whole = BigInt(wholePart || '0') * 10n ** 18n;
  const fractional = BigInt((fractionalPart + '0'.repeat(18)).slice(0, 18));
  return whole + fractional;
};

export const getHighlightVectorPriceInWei = (vector: HighlightMintVector): string | undefined => {
  const mintFee = highlightEthToWei(vector.paymentCurrency?.mintFee);
  const price = highlightEthToWei(vector.price);
  if (mintFee === undefined || price === undefined) {
    return undefined;
  }
  return (price + mintFee).toString();
};

export const getHighlightCollectionById = async (
  resources: MintIngestorResources,
  id: string,
): Promise<Collection | undefined> => {
  return getHighlightCollectionDetails(resources, id);
};

const getHighlightCollectionByOnChainId = async (
  resources: MintIngestorResources,
  onChainId: string,
): Promise<Collection | undefined> => {
  const collectionId = await getHighlightCollectionIdByOnChainId(resources, onChainId);
  if (!collectionId) {
    return undefined;
  }
  return getHighlightCollectionDetails(resources, collectionId);
};

const getCreatorAddress = (collection: Collection): string | undefined => {
  const creatorAddress =
    collection.creatorAddresses?.find(({ address }) => EVM_ADDRESS_REGEX.test(address))?.address ||
    collection.creatorAccountSettings?.walletAddresses?.find((address) => EVM_ADDRESS_REGEX.test(address));

  return creatorAddress?.toLowerCase();
};

export const getHighlightMintDataForCollection = (
  collection: Collection,
  chainId: number = collection.chainId,
): CollectionByAddress | undefined => {
  if (collection.chainId !== chainId || !isSupportedHighlightChain(collection.chainId) || !collection.collectionImage) {
    return undefined;
  }

  const mintVector = getHighlightPrimaryMintVector(collection, chainId);
  const creator = getCreatorAddress(collection);

  if (!mintVector || !creator) {
    return undefined;
  }

  return {
    id: collection.id,
    chainId: collection.chainId,
    name: collection.name,
    description: collection.description,
    image: collection.collectionImage,
    sampleImages: [collection.collectionImage],
    creator,
    contract: collection.address,
    primaryContract: collection.address,
    mintVector,
    creatorAccountSettings: collection.creatorAccountSettings,
  };
};

export const getHighlightCollectionByAddress = async (
  resources: MintIngestorResources,
  contractOptions: MintContractOptions,
): Promise<CollectionByAddress | undefined> => {
  if (!isSupportedHighlightChain(contractOptions.chainId)) {
    return undefined;
  }

  try {
    const collection =
      (await getHighlightCollectionByOnChainId(
        resources,
        `${contractOptions.chainId}:${contractOptions.contractAddress}:0`,
      )) ||
      (await getHighlightCollectionDetails(
        resources,
        `${HIGHLIGHT_CHAIN_PREFIX_BY_ID[contractOptions.chainId]}:${contractOptions.contractAddress}`,
      ));

    if (!collection) {
      return undefined;
    }

    return getHighlightMintDataForCollection(collection, contractOptions.chainId);
  } catch (error) {}
};
