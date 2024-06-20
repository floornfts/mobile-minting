export type MintTemplate = {
  name: string;
  description?: string | null;

  featuredImageUrl: string | null;
  images: MintImage[];
  originalUrl: string;
  creator?: MintArtistMetadata | null;

  /* Contract details */
  mintInstructionType: MintInstructionType;
  mintInstructions: EVMMintInstructions | SolanaMintInstructions;

  /* Availability */
  liveDate: Date | null;
  availableForPurchaseStart: Date | null;
  availableForPurchaseEnd: Date | null;

  /* Partner */
  partnerName: string | null;
  promotionaltext: string | null;
};

export enum MintInstructionType {
  EVM_MINT = 'EVM_MINT',
  SOLANA_MINT = 'SOLANA_MINT',
}

export type EVMMintInstructions = {
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

  /* The price in wei to be submitted to the contract */
  priceWei: string;
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
  websiteUrl?: string | null;
  description?: string | null;
  twitterHandle?: string | null;
  instagram?: string | null;
  discord?: string | null;
  tikTok?: string | null;
  github?: string | null;
  farcaster?: string | null;
};
