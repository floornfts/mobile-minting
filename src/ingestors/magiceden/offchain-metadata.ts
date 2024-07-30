import { MintContractOptions, MintIngestorResources } from 'src/lib';
import { Collection } from './types';

export const getMagicEdenCollectionByAddress = async (
  resources: MintIngestorResources,
  contarctOptions: MintContractOptions,
): Promise<Collection | undefined> => {
  const options = {
    method: 'GET',
    url: 'https://api-mainnet.magiceden.dev/v3/rtp/base/collections/v7',
    params: {
      id: contarctOptions.contractAddress,
      includeMintStages: 'false',
      includeSecurityConfigs: 'false',
      normalizeRoyalties: 'false',
      useNonFlaggedFloorAsk: 'false',
      sortBy: 'allTimeVolume',
      limit: '20',
    },
    headers: {
      Authorization: 'Bearer YOUR_API_KEY',
      Accept: '*/*',
    },
  };

  try {
    const resp = await resources.fetcher(options);
    return resp.data.collections[0];
  } catch (error: any) {}
};

export const getMagicEdenCollectionBySlug = async (
  resources: MintIngestorResources,
  slug: string | undefined,
): Promise<Collection | undefined> => {
  if (!slug) {
    return;
  }

  const options = {
    method: 'GET',
    url: 'https://api-mainnet.magiceden.dev/v3/rtp/base/collections/v7',
    params: {
      name: slug,
      includeMintStages: 'false',
      includeSecurityConfigs: 'false',
      normalizeRoyalties: 'false',
      useNonFlaggedFloorAsk: 'false',
      sortBy: 'allTimeVolume',
      limit: '20',
    },
    headers: {
      Authorization: 'Bearer YOUR_API_KEY',
      Accept: '*/*',
    },
  };

  try {
    const resp = await resources.fetcher(options);
    for (let i = 0; i < resp.data.collections.length; i++) {
      if (await getMagicEdenMintInstructions(resources, resp.data.collections[i].id)) return resp.data.collections[i];
    }
  } catch (error: any) {
    console.log(error);
  }
};

export const getMagicEdenMintInstructions = async (resources: MintIngestorResources, collection: string) => {
  const config = {
    method: 'post',
    url: 'https://api-base.reservoir.tools/execute/mint/v1',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'x-api-key': 'demo-api-key',
    },
    data: {
      items: [
        {
          collection,
        },
      ],
      onlyPath: false,
      partial: true,
      skipBalanceCheck: false,
      taker: '0x0000000000000000000000000000000000000000',
    },
  };

  try {
    const resp = await resources.fetcher(config);
    const saleData = resp.data.steps.find((step: { id: string }) => step.id === 'sale');
    const mintItem = saleData.items.find((item: { orderIds: string }) => item.orderIds[0] === `mint:${collection}`);
    return mintItem.data;
  } catch (error: any) {
    // console.log(error)
  }
};
