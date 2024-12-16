import { MintIngestor } from '../lib/types/mint-ingestor';
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
  'zora-internal': new ZoraInternalIngestor(),
  rodeo: new RodeoIngestor(),
  fxhash: new FxHashIngestor(),
  manifold: new ManifoldIngestor(),
  rarible: new RaribleIngestor(),
  transient: new TransientIngestor(),
  highlight: new HighlightIngestor(),
  foundation: new FoundationIngestor(),
  'coinbase-wallet': new CoinbaseWalletIngestor(),
};

export * from './';
