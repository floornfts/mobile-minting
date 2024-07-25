import { FxHashIngestor } from './fxhash';
import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { TransientIngestor } from './transient-base';
import { OpenSeaIngestor } from './opensea';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  transient: new TransientIngestor(),
  opensea: new OpenSeaIngestor(),
};

export * from './';
