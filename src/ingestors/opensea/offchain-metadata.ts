import { Contract } from 'alchemy-sdk';
import { MintContractOptions, MintIngestorResources } from 'src/lib';
import { Collection, Creator } from './types';

import dotenv from 'dotenv';
dotenv.config();

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'x-api-key': process.env.OPENSEA_API_KEY,
  },
};

export const getOpenSeaMintByContract = async (
  resources: MintIngestorResources,
  contract: MintContractOptions,
): Promise<Contract | undefined> => {
  try {
    const resp = await resources.fetcher(
      `https://api.opensea.io/api/v2/chain/base/contract/${contract.contractAddress}`,
      options,
    );
    return resp.data;
  } catch (error: any) {
    return;
  }
};

export const getOpenSeaCollectionBySlug = async (
  resources: MintIngestorResources,
  slug: string | undefined,
): Promise<Collection | undefined> => {
  try {
    const resp = await resources.fetcher(`https://api.opensea.io/api/v2/collections/${slug}`, options);
    if (!resp.data && !resp.data.contracts) {
      throw new Error('Empty response');
    }

    return resp.data;
  } catch (error: any) {
    return;
  }
};

export const getMintCreatorByAddress = async (
  resources: MintIngestorResources,
  address: string,
): Promise<Creator | undefined> => {
  try {
    const resp = await resources.fetcher(`https://api.opensea.io/api/v2/accounts/${address}`, options);
    if (!resp.data && !resp.data.username) {
      throw new Error('No account found.');
    }

    return resp.data;
  } catch (error: any) {
    return;
  }
};
