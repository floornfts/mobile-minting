import { expect } from 'chai';
import { FoundationIngestor } from '../../src/ingestors/foundation';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('foundation', function () {
  basicIngestorTests(new FoundationIngestor(), resources, {
    successUrls: [
      'https://foundation.app/mint/base/0xCb6B679F5cD8E5c153CDC627F16C730f91e1fBfd',
      'https://foundation.app/mint/base/0x36F38d3fCE10AD959b3A21ddfC8bDA8EE254B595'
    ],
    failureUrls: [
      'https://foundation.app/mint/eth/0xcc5C8eb0108d85f091e4468999E0D6fd4273eD99',
      'https://foundation.app/mint/base/the-billows',
    ],
    successContracts: [
      { chainId: 8453, contractAddress: '0xCb6B679F5cD8E5c153CDC627F16C730f91e1fBfd' },
      { chainId: 8453, contractAddress: '0x36F38d3fCE10AD959b3A21ddfC8bDA8EE254B595' }
    ],
    failureContracts: [
      { chainId: 1, contractAddress: '0xcc5C8eb0108d85f091e4468999E0D6fd4273eD99' },
      { chainId: 8453, contractAddress: 'the-billows' }
    ]
  });
  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new FoundationIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new FoundationIngestor();
    const url = 'https://foundation.app/mint/base/0xCb6B679F5cD8E5c153CDC627F16C730f91e1fBfd';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://foundation.app/mint/base/0xFf82B9D1873C7A252CB9A2712318422fAafc5297';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with frame contract', async function () {
    const ingestor = new FoundationIngestor();
    const url = 'https://foundation.app/mint/base/0x89E63F58da71E9CD4DA439C3D1194917c67eb869';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Eternal Beauty');
    expect(template.description).to.contain('Beauty carved into the eternal marble.');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x62037b26ffF91929655AA3A060F327b47d1e2b3e');
    expect(mintInstructions.contractMethod).to.equal('mintFromFixedPriceSaleWithEarlyAccessAllowlistV2');
    expect(mintInstructions.contractParams).to.equal(
      '["0x89E63F58da71E9CD4DA439C3D1194917c67eb869", 1, address, "0x0000000000000000000000000000000000000000", ["0x00000000000000000000000000000000000000000000000000000000000000a0", "0x0000000000000000000000000000000000000000000000000000000000000000"]]',
    );
    expect(mintInstructions.priceWei).to.equal('7700000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://f8n-production-collection-assets.imgix.net/8453/0x89E63F58da71E9CD4DA439C3D1194917c67eb869/pre_reveal/nft.jpg',
    );

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-07-04T16:00:00.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2030-01-01T00:00:00.000Z'));
  });

  it.skip('createMintTemplateForUrl: Returns a mint template for a supported URL with fixed price contract', async function () {
    const ingestor = new FoundationIngestor();
    const url = 'https://foundation.app/mint/base/0x89e63f58da71e800000000000000000000000000';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Eternal Beauty');
    expect(template.description).to.contain('Beauty carved into the eternal marble.');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x62037b26fff91800000000000000000000000000');
    expect(mintInstructions.contractMethod).to.equal('mintFromFixedPriceSaleWithEarlyAccessAllowlistV1');
    expect(mintInstructions.contractParams).to.equal(
      '["0x89e63f58da71e800000000000000000000000000", 1, address, "0x0000000000000000000000000000000000000000", ["0x00000000000000000000000000000000000000000000000000000000000000a0", "0x0000000000000000000000000000000000000000000000000000000000000000"]]',
    );
    expect(mintInstructions.priceWei).to.equal('7699999999999999');

    expect(template.featuredImageUrl).to.equal(
      'https://f7n-production-collection-assets.imgix.net/8453/0x89E63F58da71E9CD4DA439C3D1194917c67eb869/pre_reveal/nft.jpg',
    );

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2023-07-04T16:00:00.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2029-01-01T00:00:00.000Z'));
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with dynamic price contract', async function () {
    const ingestor = new FoundationIngestor();
    const url = 'https://foundation.app/mint/base/0x0C92Ce2aECc651Dd3733008A301f126662ae4A50';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Abstract 50');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x62037b26ffF91929655AA3A060F327b47d1e2b3e');
    expect(mintInstructions.contractMethod).to.equal('mintFromDutchAuctionV2');
    expect(mintInstructions.contractParams).to.equal('["0x0C92Ce2aECc651Dd3733008A301f126662ae4A50", 1, address]');
    expect(mintInstructions.priceWei).to.equal('9900800000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://f8n-production-collection-assets.imgix.net/8453/0x0C92Ce2aECc651Dd3733008A301f126662ae4A50/pre_reveal/nft.jpg',
    );

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-08-10T21:00:00.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2024-08-15T21:00:00.000Z'));
  });

  it('supportsContract: Returns false for a non supported contract', async function () {
    const ingestor = new FoundationIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x914cf2d92b087C9C01a062111392163c3B35B60e',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.false;
  });

  it('supportsContract: Returns true for a supported contract', async function () {
    const ingestor = new FoundationIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x8D41Ef1EB5113c2E55a08a0C299526ef6d027c80',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.true;
  });
});
