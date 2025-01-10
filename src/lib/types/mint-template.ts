export type MintTemplate = {
  name: string;
  description?: string | null;

  featuredImageUrl: UrlImage | null;
  featuredImageArtifact: ArtifactImage | null;
  images: MintImage[];
  marketingUrl: string;
  creator?: MintArtistMetadata | null;

  /* Contract details */
  mintInstructionType: MintInstructionType;
  mintInstructions: EVMMintInstructions | SolanaMintInstructions;
  /* The address of the NFT contract, if different from the mint contract */
  mintOutputContract: CollectionContract | null;

  /* Availability */
  liveDate: Date | null;
  availableForPurchaseStart: Date | null;
  availableForPurchaseEnd: Date | null;

  /* Partner */
  partnerName: string | null;
  promotionaltext: string | null;
};

/* Returns a string url */
type UrlImage = `https://${string}`;

/* Returns base64 encoded image */
type ArtifactImage = `data:image/svg+xml;base64,${string}`;

export enum MintInstructionType {
  EVM_MINT = 'EVM_MINT',
  SOLANA_MINT = 'SOLANA_MINT',
}

export type EVMMintInstructionsInput = {
  chainId: number;
  contractAddress: string;
  abi: any;
  contractMethod: string;
  /* 
       Unencoded string of the array of contract parameters to be passed to the contract
       Supports expandable templates params:
        - address - the recipient address
        e.g.
        ['1', address]
    */
  contractParams: string;
  tokenId?: number | null;

  /* The price in wei to be submitted to the contract */
  priceWei: string;
  supportsQuantity?: boolean | undefined;
  defaultQuantity?: number | undefined;
  mintFeePerTokenWei?: string | undefined;
};

export type EVMMintInstructions = EVMMintInstructionsInput & {
  supportsQuantity: boolean;
  defaultQuantity: number;
  mintFeePerTokenWei: string;
};

export type SolanaMintInstructions = {
  mintAddress: string;
  tokenMetadata: string;
};

export type Amount = {
  amount: number;
  currency: string;
  usdEquivalent?: number;
};

export type MintImage = {
  url: string;
  caption?: string | null;
};

export type MintArtistMetadata = {
  name: string;
  imageUrl?: string | null;
  walletAddress?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  twitterUsername?: string | null;
  floorUsername?: string | null;
  instagramUsername?: string | null;
  discordUsername?: string | null;
  tikTokUsername?: string | null;
  githubUsername?: string | null;
  farcasterUsername?: string | null;
};

export type CollectionContract = {
  address: string;
  chainId: number;
  tokenId?: number | null;
};
