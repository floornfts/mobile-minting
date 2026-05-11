export type Collection = {
  id: string;
  name: string;
  description: string;
  collectionImage: string;
  marketplaceId: string;
  accountId: string;
  address: string;
  symbol: string;
  chainId: number;
  status: string;
  baseUri: string;
  creatorAddresses?: {
    address: string;
    name: string | null;
  }[];
  creatorAccountSettings?: {
    displayAvatar?: string | null;
    displayName?: string | null;
    walletAddresses?: string[];
  } | null;
  mintVectors?: HighlightMintVector[];
};

export type HighlightMintVector = {
  name: string;
  start: string;
  end: string | null;
  paused: boolean;
  price: string;
  currency: string;
  chainId: number;
  onchainMintVectorId: string | null;
  paymentCurrency?: {
    address: string;
    decimals: number;
    symbol: string;
    type: string;
    mintFee: string | null;
  } | null;
};

export type CollectionByAddress = {
  id: string;
  chainId: number;
  name: string;
  description: string;
  image: string;
  sampleImages: string[];
  creator: string;
  contract: string;
  primaryContract: string;
  mintVector: HighlightMintVector;
  creatorAccountSettings?: Collection["creatorAccountSettings"];
};
