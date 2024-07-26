import { expect } from 'chai';
import { HighlightIngestor } from '../../src/ingestors/highlight';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('highlight', function () {
  basicIngestorTests(new HighlightIngestor(), resources, {
    successUrls: [
      'https://highlight.xyz/mint/665fa33f07b3436991e55632',
      'https://highlight.xyz/mint/66856628ff8a01fdccc132f4',
    ],
    failureUrls: [
      'https://highlight.xyz/mint/66963c500b48236f1acf322b',
      'https://foundation.app/mint/base/the-billows',
    ],
    successContracts: [
      { chainId: 8453, contractAddress: '0x0E5DDe3De7cf2761d8a81Ee68F48410425e2dBbA' },
      { chainId: 8453, contractAddress: '0xBE96B2572CA0F1ac8ec6323Bc9037AffD270bA7F' },
    ],
    failureContracts: [{ chainId: 5000, contractAddress: '0x62F8C536De24ED32611f128f64F6eAbd9b82176c' }],
  });
  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new HighlightIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new HighlightIngestor();
    const url = 'https://highlight.xyz/mint/66966e909562252851632a96';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://highlight.xyz/mint/66966e909562252851632a96';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
    const ingestor = new HighlightIngestor();
    const url = 'https://highlight.xyz/mint/665fa33f07b3436991e55632';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('COMBAT MODE by Emily Xie');
    expect(template.description).to.contain(
      'It depicts two creatures in battle, melding the nostalgia of old school video games with the contemporary possibilities of digital illustration.',
    );
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x8087039152c472Fa74F47398628fF002994056EA');
    expect(mintInstructions.contractMethod).to.equal('vectorMint721');
    expect(mintInstructions.contractParams).to.equal('[866, 1, address]');
    expect(mintInstructions.priceWei).to.equal('2100000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://img.reservoir.tools/images/v2/base/z9JRSpLYGu7%2BCZoKWtAuANCXTgWBry4OTpgBkNYv7UVX%2FOELQ1B1IQGOoFgJBPmEzWQJa5hKPeiypcjXnSgXVEhZJDeOg9vk5slunBxp8ABMKIlkw3COL8nejLu9cx7f5QrJHJecqNaXIZCHlWY311DY%2F4e9zjeJnyY%2Fvp3J%2FivCSdJShfdu2%2FoCfqed8TvVTrlrElK7Wp8owCwKnZNhaw%3D%3D',
    );

    if (template.creator) {
      expect(template.creator.name).to.equal('Emily Xie');
      expect(template.creator.walletAddress).to.equal('0x591a0b1994e8880215b89c5b9cd8d0738e5c0f1e');
      expect(template.creator.imageUrl).to.equal(
        'https://highlight-creator-assets.highlight.xyz/main/image/91eaf712-b9de-49e4-8674-85f37dd823e0.png',
      );
    }

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-06-05T16:00:00.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2024-08-31T16:00:00.000Z'));
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with free price', async function () {
    const ingestor = new HighlightIngestor();
    const url = 'https://highlight.xyz/mint/66744e64e610ed36adeb1a64';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('RGB Friends');
    expect(template.description).to.contain('RGB Friends is an infinite, generative PFP collection');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x8087039152c472Fa74F47398628fF002994056EA');
    expect(mintInstructions.contractMethod).to.equal('vectorMint721');
    expect(mintInstructions.contractParams).to.equal('[977, 1, address]');
    expect(mintInstructions.priceWei).to.equal('800000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://img.reservoir.tools/images/v2/base/z9JRSpLYGu7%2BCZoKWtAuAKM5v2dthdDNgoFYsopVhfXBHjSfVbMXHiaW1XsdogS5oNzhOcvyJcxoIKiiKqHsNxiXyJX%2B%2BppNtkeQvHYCslZTqG21HhITlOtTV8jhhZhOQdWST4CHb1DA%2B5K8ZAHTSu9b0MV4dWJJsqPVJ439DhVcURxmw1fKJ4pAhC3iCwl1DOXK1xnEOnLO0il04rMAPA%3D%3D',
    );

    if (template.creator) {
      expect(template.creator.name).to.equal('RGB');
      expect(template.creator.walletAddress).to.equal('0xf3e2399c5d1c698a6c1dfa195adbd12a6afd1899');
      expect(template.creator.imageUrl).to.equal(
        'https://highlight-creator-assets.highlight.xyz/main/image/47cfb18b-a189-41f2-8013-1cee51c0c08d.png',
      );
    }

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-06-20T17:00:04.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2030-01-01T00:00:00.000Z'));
  });
});
