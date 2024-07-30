import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { ManifoldIngestor } from './manifold';
import { FxHashIngestor } from './fxhash';
import { TransientIngestor } from './transient-base';
import { HighlightIngestor } from './highlight';
import { FoundationIngestor } from './foundation';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  manifold: new ManifoldIngestor(),
  transient: new TransientIngestor(),
  highlight: new HighlightIngestor(),
  foundation: new FoundationIngestor(),
};

export * from './';
