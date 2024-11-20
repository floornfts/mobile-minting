import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { HighlightIngestor } from '../../src/ingestors/highlight';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { expect } from 'chai';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();

describe('highlight', function () {
  basicIngestorTests(
    new HighlightIngestor(),
    resources,
    {
      successUrls: [
        'https://highlight.xyz/mint/66856628ff8a01fdccc132f4',
        'https://highlight.xyz/mint/66d03b0eaae45d4534822482',
      ],
      failureUrls: [
        'https://highlight.xyz/mint/66963c500b48236f1acf322b',
        'https://foundation.app/mint/base/the-billows',
      ],
      successContracts: [
        { chainId: 8453, contractAddress: '0x0E5DDe3De7cf2761d8a81Ee68F48410425e2dBbA' },
        { chainId: 8453, contractAddress: '0x7022a51D648CEB4f4D290a81A0E543979a003e86' },
      ],
      failureContracts: [{ chainId: 5000, contractAddress: '0x62F8C536De24ED32611f128f64F6eAbd9b82176c' }],
    },
    {
      '8453': '0x124F956',
    },
  );
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
    const url = 'https://highlight.xyz/mint/base:0x0E5DDe3De7cf2761d8a81Ee68F48410425e2dBbA';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Based Fren$');
    expect(template.description).to.contain('3,333 Based Fren$ muy basados');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x8087039152c472Fa74F47398628fF002994056EA');
    expect(template.mintOutputContract?.address).to.equal('0x0e5dde3de7cf2761d8a81ee68f48410425e2dbba');
    expect(mintInstructions.contractMethod).to.equal('vectorMint721');
    expect(mintInstructions.contractParams).to.equal('[1176, quantity, address]');
    expect(mintInstructions.priceWei).to.equal('800000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://img.reservoir.tools/images/v2/base/z9JRSpLYGu7%2BCZoKWtAuAI37ZMpGmBWtUpAQDl1tI6DEJRvIrkDVCqzOxkdek%2BfesLtA3sYS0SXZeU4voi8R9rQD1uumcaPxveg8%2B3UfVgFBR82zeA%2FzrfIHHRUbhHMTK4V08qvpcJ5dRYdYVwRvZPTKTulv78c%2FB6vgLUkdfSX0ND53Mjp2wUysnfKmYO5rOIxPwl1ACpM%2BOQDWOOSOzg%3D%3D',
    );

    if (template.creator) {
      expect(template.creator.name).to.equal('Nxsh');
      expect(template.creator.walletAddress).to.equal('0xf5977a695e85d3046ed8ce03dd3b562e40532200');
      expect(template.creator.imageUrl).to.equal(
        'https://highlight-creator-assets.highlight.xyz/main/image/e5eca4b9-1b8e-4ebf-8cd5-e0f6d618e15a.png',
      );
    }

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date(1720042380000));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date(1893456000000));
  });

  it.skip('createMintTemplateForUrl: Returns a mint template for a supported URL with free price', async function () {
    const ingestor = new HighlightIngestor();
    const url = 'https://highlight.xyz/mint/base:0x30d745EDC90E92b4fdCE50c5239962Cf3407B12B';
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
