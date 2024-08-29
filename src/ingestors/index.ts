import { MintIngestor } from '../lib/types/mint-ingestor';
import { ProhibitionDailyIngestor } from './prohibition-daily';
import { ManifoldIngestor } from './manifold';
import { RaribleIngestor } from './rarible';
import { FxHashIngestor } from './fxhash';
import { TransientIngestor } from './transient-base';
import { HighlightIngestor } from './highlight';
import { FoundationIngestor } from './foundation';
import { CoinbaseWalletIngestor } from './coinbase-wallet';
import { ZoraInternalIngestor } from './zora-internal';
import { RodeoIngestor } from './rodeo';

export type MintIngestionMap = {
  [key: string]: MintIngestor;
};

export const ALL_MINT_INGESTORS: MintIngestionMap = {
  'prohibition-daily': new ProhibitionDailyIngestor(),
  fxhash: new FxHashIngestor(),
  manifold: new ManifoldIngestor(),
  rarible: new RaribleIngestor(),
  transient: new TransientIngestor(),
  highlight: new HighlightIngestor(),
  foundation: new FoundationIngestor(),
  'coinbase-wallet': new CoinbaseWalletIngestor(),
  'zora-internal': new ZoraInternalIngestor(),
  rodeo: new RodeoIngestor(),
};

export * from './';
