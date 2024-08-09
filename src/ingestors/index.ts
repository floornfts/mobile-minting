import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { FxHashIngestor } from './fxhash';
import { HighlightIngestor } from './highlight';
import { TransientIngestor } from './transient-base';
import { FoundationIngestor } from './foundation';
import { ZoraInternalIngestor } from './zora-internal';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  highlight: new HighlightIngestor(),
  transient: new TransientIngestor(),
  foundation: new FoundationIngestor(),
  'zora-internal': new ZoraInternalIngestor(),
};

export * from './';
