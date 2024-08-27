import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { RaribleIngestor } from './rarible';
import { FxHashIngestor } from './fxhash';
import { HighlightIngestor } from './highlight';
import { TransientIngestor } from './transient-base';
import { FoundationIngestor } from './foundation';
import { ZoraInternalIngestor } from './zora-internal';
import { RodeoIngestor } from './rodeo';
import { ZoraIngestor } from './zora-base';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  rarible: new RaribleIngestor(),
  highlight: new HighlightIngestor(),
  transient: new TransientIngestor(),
  foundation: new FoundationIngestor(),
  "zora-base": new ZoraIngestor()
  'zora-internal': new ZoraInternalIngestor(),
  rodeo: new RodeoIngestor(),
};

export * from './';
