import { expect } from 'chai';
import { VvIngestor } from '../../src/ingestors/vv';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('vv', function () {
  basicIngestorTests(new VvIngestor(), resources, {
    successUrls: ['https://mint.vv.xyz/0xcb52f0fe1d559cd2869db7f29753e8951381b4a3/1'],
    failureUrls: [
      'https://mint.vv.xyz/0xcb52f0fe1d559cd2869db7f29753e8951381b4a3',
      'https://foundation.app/mint/eth/0xcc5C8eb0108d85f091e4468999E0D6fd4273eD99',
    ],
    successContracts: [{ chainId: 1, contractAddress: '0xcb52f0fe1d559cd2869db7f29753e8951381b4a3' }],
    failureContracts: [{ chainId: 8453, contractAddress: '0xcb52f0fe1d559cd2869db7f29753e8951381b4a3' }],
  });
  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new VvIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new VvIngestor();
    const url = 'https://mint.vv.xyz/0xcb52f0fe1d559cd2869db7f29753e8951381b4a3/1';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;
  });

  // TODO Contract works for latest token id
  it('supportsContract: Returns true for a supported contract', async function () {
    const ingestor = new VvIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 1,
      contractAddress: '0xcb52f0fe1d559cd2869db7f29753e8951381b4a3',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.true;
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with frame contract', async function () {
    const ingestor = new VvIngestor();
    const url = 'https://mint.vv.xyz/0xcb52f0fe1d559cd2869db7f29753e8951381b4a3/1';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Eternal Beauty');
    expect(template.description).to.contain('Beauty carved into the eternal marble.');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x62037b26ffF91929655AA3A060F327b47d1e2b3e');
    expect(mintInstructions.contractMethod).to.equal('mintFromFixedPriceSaleV2');
    expect(mintInstructions.contractParams).to.equal(
      '["0x89E63F58da71E9CD4DA439C3D1194917c67eb869", 1, address, "0x0000000000000000000000000000000000000000"]',
    );

    expect(mintInstructions.priceWei).to.equal('0');

    expect(template.featuredImageUrl).to.equal(
      'https://f8n-production-collection-assets.imgix.net/8453/0x89E63F58da71E9CD4DA439C3D1194917c67eb869/pre_reveal/nft.jpg',
    );

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-07-04T19:00:00.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2030-01-01T00:00:00.000Z'));
  });
});
