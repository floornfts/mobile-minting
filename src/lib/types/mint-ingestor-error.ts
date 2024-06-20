export type CouldNotResolveMintError = 'CouldNotResolveMint';
export type MissingRequiredDataError = 'MissingRequiredData';
export type MintUnsupportedNetworkError = 'MintUnsupportedNetwork';
export type MintUnsupportedMintTypeError = 'MintUnsupportedMintType';
export type MintLimitedByWalletError = 'MintLimitedByWallet';

export enum MintIngestionErrorName {
  IncompatibleUrl = 'IncompatibleUrl',
  CouldNotResolveMint = 'CouldNotResolveMint',
  MissingRequiredData = 'MissingRequiredData',
  MintUnsupportedNetwork = 'MintUnsupportedNetwork',
  MintUnsupportedMintType = 'MintUnsupportedMintType',
  MintLimitedByWallet = 'MintLimitedByWallet',
}

export class MintIngestorError extends Error {
  name: MintIngestionErrorName;
  message: string;
  cause: any;
  constructor(name: MintIngestionErrorName, message: string, cause?: any) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
