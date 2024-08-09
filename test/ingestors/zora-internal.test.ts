import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { ZoraInternalIngestor } from '../../src/ingestors/zora-internal/';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();

describe('zora-internal', () => {
  basicIngestorTests(
    new ZoraInternalIngestor(),
    resources,
    {
      successUrls: [
        'https://zora.co/collect/zora:0x8f7e477b246bfd8c7f342ce21167377d81e71a63/1',
        'https://zora.co/collect/base:0x9d2fc5ffe5939efd1d573f975bc5eefd364779ae/5',
        'https://zora.co/collect/zora:0xd8fce2db92ecd0eab48421f016621e29142c7cf2/16',
      ],
      failureUrls: [],
      successContracts: [
        {
          chainId: 7777777,
          contractAddress: '0x8f7e477b246bfd8c7f342ce21167377d81e71a63',
          tokenId: '1',
        },
        {
          chainId: 7777777,
          contractAddress: '0xd8fce2db92ecd0eab48421f016621e29142c7cf2',
          tokenId: '16',
        },
        {
          chainId: 8453,
          contractAddress: '0x9d2fc5ffe5939efd1d573f975bc5eefd364779ae',
          tokenId: '5',
        },
      ],
      failureContracts: [
        {
          chainId: 7777777,
          contractAddress: '2342434',
          tokenId: '2',
        },
      ],
    },
    {
      '7777777': '0x116B753',
      '8453': '0x115FCE5',
    },
  );
});
