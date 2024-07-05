export type Creator = {
  username: string;
  address: string;
  website: string;
  bio: string;
  profile_image_url: string;
  social_media_accounts: SocialMediaPlatform[];
  joined_date: string;
};

export type SocialMediaPlatform = {
  platform: string;
  username: string;
};

export type Contract = {
  address: string;
  chain: string;
  collection: string;
};

export type Collection = {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: string;
  opensea_url: string;
  project_url: string;
  contracts: Contract[];
  total_supply: number;
  created_date: string;
  fees: { fee: number; recipient: string; required: boolean }[];
};
