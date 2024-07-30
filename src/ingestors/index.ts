import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { FxHashIngestor } from './fxhash';
import { OpenSeaIngestor } from './opensea';
import { TransientIngestor } from './transient-base';
import { HighlightIngestor } from './highlight';
import { FoundationIngestor } from './foundation';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  opensea: new OpenSeaIngestor(),
  transient: new TransientIngestor(),
  highlight: new HighlightIngestor(),
  foundation: new FoundationIngestor(),
};

export * from './';
