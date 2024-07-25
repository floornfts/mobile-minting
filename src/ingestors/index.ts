import { FxHashIngestor } from './fxhash';
import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { ZoraIngestor } from './zora';  // From current branch
import { TransientIngestor } from './transient-base';  // From current branch

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  'zora': new ZoraIngestor(),  // From current branch
  transient: new TransientIngestor()  // From current branch
};

export * from './';
