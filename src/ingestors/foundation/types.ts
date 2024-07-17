import { Alchemy } from "alchemy-sdk";

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
  endTime: string;
  generalAvailabilityStartTime: Date;
  saleType: "FIXED_PRICE_DROP";
  creator: any;
  coverImageUrl: string;
  media: any;
  contractAddress: any;
  collection: string;
  name: string;
  description: string;
  owner: string;
  contracts: Contract[];
  fees: { fee: number; recipient: string; required: boolean }[];
};
