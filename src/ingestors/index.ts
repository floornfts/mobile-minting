import { FxHashIngestor } from './fxhash';
import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { TransientIngestor } from './transient-base';
import { ManifoldIngestor } from './manifold';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  manifold: new ManifoldIngestor(),
  transient: new TransientIngestor(),
};

export * from './';
