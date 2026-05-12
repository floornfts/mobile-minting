export type MintClubMetadata = {
  logo?: string | null;
  backgroundImage?: string | null;
  website?: string | null;
  creatorComment?: string | null;
  onChatSlug?: string | null;
};

export type MintClubTokenInfo = {
  creator: string;
  token: string;
  decimals: number;
  symbol: string;
  name: string;
  createdAt: number;
  currentSupply: bigint;
  maxSupply: bigint;
  priceForNextMint: bigint;
  reserveToken: string;
  reserveSymbol: string;
};

export type MintClubTokenDetails = {
  mintRoyalty: number;
  burnRoyalty: number;
  info: MintClubTokenInfo;
  reserveAmount: bigint;
  royaltyAmount: bigint;
  metadata?: MintClubMetadata;
};

export type MintClubEligibilityDetails = {
  token: string;
  symbol: string;
  currentSupply: bigint;
  maxSupply: bigint;
  reserveToken: string;
};
