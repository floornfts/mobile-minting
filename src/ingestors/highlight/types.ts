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
};

export type CollectionByAddress1 = {
  chainId: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  contractDeployedAt: string;
  name: string;
  image: string;
  symbol: string;
  description: string;
  sampleImages: string[];
  creator: string;
};

export type CollectionByAddress2 = {
  chainId: number;
  contract: string;
  highlightCollection: {
    // Vector id
    id: string;
    name: string;
    owner: string;
    imageUrl: string;
    animationUrl: string;
    address: string;
  };
};

export type CollectionByAddress = CollectionByAddress1 & CollectionByAddress2;
