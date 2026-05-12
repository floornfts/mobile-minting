import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { ScatterIngestor } from '../../src/ingestors/scatter';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { expect } from 'chai';
import { getScatterCollectionBySlug } from '../../src/ingestors/scatter/offchain-metadata';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();
const eligibleBaseCollectionSlugs = [
  'base-mutant-ape-club',
  'kemonokaki',
  'farcasterinterns',
  'nounkes',
  'world',
  'toypunks',
  'base-gorilla-yacht-club',
  'nozukis',
  'art-penguins',
  'based-3d-punks',
];

describe('Scatter', function () {
  this.timeout(60000);

  basicIngestorTests(
    new ScatterIngestor(),
    resources,
    {
      successUrls: ['https://www.scatter.art/collection/tribe-of-girl'],
      failureUrls: [
        'https://www.scatter.art/search',
        'https://example.com/collection/g-punks',
        'https://www.scatter.art/collection/g-punks',
      ],
      successContracts: [
        {
          chainId: 8453,
          contractAddress: '0xf1A741Af9FaB327aF4A858F735129Ac89055ECBE',
          url: 'https://www.scatter.art/collection/tribe-of-girl',
        },
      ],
      failureContracts: [
        { chainId: 1, contractAddress: '0xa648572b95bf1d260Daa472839D2e34005139bc8' },
        { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
      ],
    },
    {
      8453: '0x1c1c6c0',
    },
  );

  it('documents Scatter eligibility with 10 prior Base collections over 100 collectors', async function () {
    const evidence = await Promise.all(
      eligibleBaseCollectionSlugs.map(async (slug) => {
        const collection = await getScatterCollectionBySlug(resources, slug);
        return {
          slug,
          chainId: collection?.chain_id,
          mints: collection?.num_items || 0,
          owners: collection?.num_owners || 0,
        };
      }),
    );

    const failures = evidence.filter((collection) => {
      return collection.chainId !== 8453 || collection.mints < 10 || collection.owners <= 100;
    });

    expect(evidence.length).to.equal(10);
    expect(failures).to.deep.equal([]);
  });

  it('createMintTemplateForUrl: returns Scatter mint instructions for a Base collection', async function () {
    const ingestor = new ScatterIngestor();
    const template = await ingestor.createMintTemplateForUrl(resources, 'https://www.scatter.art/collection/tribe-of-girl');
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Tribes of Anime Girl');
    expect(template.description).to.equal('This is Tribes of Anime Girl.. anime');
    expect(template.featuredImageUrl).to.equal('https://ucarecdn.com/733dcb7e-ab04-4a95-8bc8-ec8c9948f4f9/');
    expect(template.marketingUrl).to.equal('https://www.scatter.art/collection/tribe-of-girl');
    expect(template.creator?.walletAddress).to.equal('0xDd9226160aE11c33CaDFA78A9dB017164bf3772F');
    expect(template.creator?.twitterUsername).to.equal('sssbbbbbbuuu');
    expect(template.mintOutputContract?.address).to.equal('0xf1A741Af9FaB327aF4A858F735129Ac89055ECBE');

    const mintInstructions = template.mintInstructions as EVMMintInstructions;
    expect(mintInstructions.chainId).to.equal(8453);
    expect(mintInstructions.contractAddress).to.equal('0xf1A741Af9FaB327aF4A858F735129Ac89055ECBE');
    expect(mintInstructions.contractMethod).to.equal('mint');
    expect(mintInstructions.contractParams).to.equal(
      '[["0x0000000000000000000000000000000000000000000000000000000000000005", []], quantity, "0x0000000000000000000000000000000000000000", "0x"]',
    );
    expect(mintInstructions.priceWei).to.equal('0');
    expect(mintInstructions.supportsQuantity).to.be.true;
  });
});
