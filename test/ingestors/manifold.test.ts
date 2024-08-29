import { expect } from 'chai';
import { ManifoldIngestor } from '../../src/ingestors/manifold';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('manifold', function () {
  basicIngestorTests(
    new ManifoldIngestor(),
    resources,
    {
      successUrls: ['https://app.manifold.xyz/c/spaceexplorer'],
      failureUrls: ['https://app.manifold.xyz/', 'https://app.manifold.xyz/x/spaceexplorer/'],
      successContracts: [
        // { chainId: 8453, contractAddress: '0xE2Cf639a5eBA5e8d1e291AEb44ac66c8c0727F98' }
      ],
      failureContracts: [
        // { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
        // { chainId: 8453, contractAddress: 'derp' }
      ],
    },
    {
      8453: '0xF469C6',
    },
  );
  it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
    const ingestor = new ManifoldIngestor();
    const url = 'https://app.manifold.xyz/c/spaceexplorer';

    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('SPACE EXPLORER');
    expect(template.description).to.equal(
      'Two astronauts exploring worlds, galaxies and universe together.\n\nLove story written with stardust, riding on there space van fully customized for there travel.\n\nThe place looks beautiful fresh breeze of air ,grass touching there feet,  \nblue sky, fluffy clouds and your love what else you need.\n\nThis 3D art is mixture of sci - fi & real world which i call fantasy.  \n(4k render 3840 x2160)',
    );
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x26bbea7803dcac346d5f5f135b57cf2c752a02be');
    expect(mintInstructions.contractMethod).to.equal('mintProxy');
    expect(mintInstructions.contractParams).to.equal(
      '["0xe2cf639a5eba5e8d1e291aeb44ac66c8c0727f98", "22534384", 1, [], [], address]',
    );
    expect(mintInstructions.priceWei).to.equal('1300000000000000');

    expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1711686600000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });
});
