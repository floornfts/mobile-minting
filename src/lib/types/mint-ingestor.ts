import { Alchemy } from 'alchemy-sdk';
import { MintTemplate } from './mint-template';
import { AxiosInstance } from 'axios';

interface MintIngestor {
  supportsUrl(url: string): Promise<boolean>;
  createMintTemplateForUrl(url: string, resources: MintIngestorResources): Promise<MintTemplate>;
}

type MintIngestorResources = {
  alchemy: Alchemy;
  fetcher: AxiosInstance;
};

export { MintIngestor, MintIngestorResources };
