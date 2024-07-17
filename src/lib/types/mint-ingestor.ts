import { Alchemy } from 'alchemy-sdk';
import { MintTemplate } from './mint-template';
import { AxiosInstance } from 'axios';

export type MintContractOptions = {
  chainId: number;
  contractAddress: string;
  tokenId?: string | undefined;
  url?: string | undefined;
};

interface MintIngestor {
  supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean>;
  supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean>;
  createMintTemplateForUrl(resources: MintIngestorResources, url: string, recipient: string): Promise<MintTemplate>;
  createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate>;

  configuration?: MintIngestorOptions;
}

type MintIngestorResources = {
  alchemy: Alchemy;
  fetcher: AxiosInstance;
};

export type MintIngestorOptions = {
  /* Expensive Calls
    * Flag to indicate that the URL check is expensive
    * This could be an HTTP call that is slow or rate limited
    
    These may not be run in test suites in all cases
  */
  supportsUrlIsExpensive?: boolean;
  supportsContractIsExpensive?: boolean;
}

export { MintIngestor, MintIngestorResources };
