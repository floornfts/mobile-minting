import { MintContractOptions, MintIngestorResources } from 'src/lib';
import { Collection, Profile } from './types';

export const getCoinbaseWalletCollectionByAddress = async (
  resources: MintIngestorResources,
  contractAddress: string,
): Promise<Collection | undefined> => {
  const url = `https://api.wallet.coinbase.com/rpc/v3/creators/trendingMint?network=networks%2Fbase-mainnet&address=${contractAddress}`;

  try {
    const resp = await resources.fetcher.get(url, {});
    return resp.data.collection;
  } catch (error: any) {
  }
};

export const getCoinbaseWalletCreator = async (resources: MintIngestorResources, address: string): Promise<Profile | undefined> => {
  const url = `https://api.wallet.coinbase.com/rpc/v2/getBasicPublicProfiles?addresses=${address}`;

  try {
    const resp = await resources.fetcher.get(url);
    const profile = resp.data.result.profiles[address];
    return profile;
  } catch (error) {}
};
