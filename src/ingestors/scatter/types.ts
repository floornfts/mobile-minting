export type ScatterCollection = {
  id?: string;
  slug?: string;
  name: string;
  description?: string | null;
  address: string;
  chain_id: number;
  max_items?: number | null;
  num_items?: number | null;
  num_owners?: number | null;
  avatar_uri?: string | null;
  banner_uri?: string | null;
  hero_uri?: string | null;
  creator_address?: string | null;
  twitter?: string | null;
  discord?: string | null;
  website?: string | null;
  abi?: string;
};

export type ScatterInviteList = {
  id: string;
  name: string;
  root: string;
  address: string;
  currency_address: string;
  currency_symbol: string;
  token_price: string;
  decimals: number;
  start_time?: string | null;
  end_time?: string | null;
  wallet_limit?: number | null;
  list_limit?: number | null;
  unit_size?: number | null;
};

export type ScatterMintResponse = {
  mintTransaction?: {
    to: string;
    value: string;
    data: string;
  };
  erc20s?: {
    address: string;
    amount: string;
  }[];
};

export type ScatterMintOption = {
  inviteList: ScatterInviteList;
  mintResponse: ScatterMintResponse;
};
