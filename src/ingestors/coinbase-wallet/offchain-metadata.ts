import { MintIngestorResources } from 'src/lib';
import { Profile } from './types';

export const getCoinbaseWalletCreator = async (resources: MintIngestorResources, address: string): Promise<Profile | undefined> => {
  const url = `https://api.wallet.coinbase.com/rpc/v2/getBasicPublicProfiles?addresses=${address}`;

  try {
    const resp = await resources.fetcher.get(url);
    const profile = resp.data.result.profiles[address];
    return profile;
  } catch (error) {}
};
