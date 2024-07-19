import { MintContractOptions, MintIngestorResources } from 'src/lib';
import { Collection, CollectionByAddress, CollectionByAddress1 } from './types';

export const getCollectionById = async (
  resources: MintIngestorResources,
  id: string,
): Promise<Collection | undefined> => {
  const url = 'https://api.highlight.xyz:8080/';

  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
  };

  const data = {
    operationName: 'GetCollectionDetails',
    variables: {
      collectionId: id,
    },
    query: `
      query GetCollectionDetails($collectionId: String!) {
        getPublicCollectionDetails(collectionId: $collectionId) {
          id
          name
          description
          collectionImage
          marketplaceId
          accountId
          address
          symbol
          chainId
          status
          baseUri
          onChainBaseUri
        }
      }
    `,
  };

  try {
    const resp = await resources.fetcher.post(url, data, { headers });
    if (!resp.data.data) {
      throw new Error("Empty response");
    }
    return resp.data.data.getPublicCollectionDetails;
  } catch (error) {
    
  }
};

export const getCollectionByAddress = async (
  resources: MintIngestorResources,
  contractOptioons: MintContractOptions,
): Promise<CollectionByAddress | undefined> => {
  try {
    const resp = await resources.fetcher(
      `https://marketplace.highlight.xyz/reservoir/base/collections/v7?id=${contractOptioons.contractAddress}&normalizeRoyalties=false`,
    );
    const collection1: CollectionByAddress1 = resp.data.collections.find((c: CollectionByAddress) => {
      return c.id.toLowerCase() === contractOptioons.contractAddress.toLowerCase() && c.chainId === 8453;
    });

    const resp2 = await resources.fetcher(
      `https://marketplace.highlight.xyz/reservoir/base/tokens/v7?collection=${contractOptioons.contractAddress}&limit=1&normalizeRoyalties=false`,
    );
    const collection2 = resp2.data.tokens[0];
    return {
      ...collection1,
      ...collection2,
    };
  } catch (error) {}
};

export const getVectorId = async (resources: MintIngestorResources, id: string): Promise<string | undefined> => {
  const url = 'https://api.highlight.xyz:8080/';

  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
  };

  const data = {
    operationName: 'GetCollectionSaleDetails',
    variables: {
      collectionId: id,
    },
    query: `
    query GetCollectionSaleDetails($collectionId: String!) {
      getPublicCollectionDetails(collectionId: $collectionId) {
        size
        mintVectors {
          name
          start
          end
          paused
          price
          currency
          chainId
          paymentCurrency {
            address
            decimals
            symbol
            type
            mintFee
          }
          onchainMintVectorId
        }
      }
    }
  `,
  };

  try {
    const resp = await resources.fetcher.post(url, data, { headers });
    const vectorString = resp.data.data.getPublicCollectionDetails.mintVectors.find(
      (c: { chainId: number }) => c.chainId === 8453,
    ).onchainMintVectorId;
    const vectorId = vectorString.split(':').pop();
    return vectorId;
  } catch (error) {}
};
