import { expect } from 'chai';
import { MagicEdenIngestor } from '../../src/ingestors/magiceden';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

describe('nftpricefloor', function () {
  basicIngestorTests(new MagicEdenIngestor(), mintIngestorResources(), {
    successUrls: [
      'https://magiceden.io/launchpad/base/the_legend_of_long_wei',
      'https://magiceden.io/launchpad/base/raiinmaker',
    ],
    failureUrls: ['https://nftpricefloor.com/nft-drops/nerzo-passport?blockchains=polygon'],
    successContracts: [
      {
        chainId: 8453,
        contractAddress: '0xEEadefc9Df7ed4995cb93f5b5D9b923a7Dff8599',
      },
    ],
    failureContracts: [
      {
        chainId: 8453,
        contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB',
      },
    ],
  });

  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new MagicEdenIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new MagicEdenIngestor();
    const url = 'https://magiceden.io/launchpad/base/the_legend_of_long_wei';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://magiceden.io/launchpad/base/mochi';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL from Launchpad', async function () {
    const ingestor = new MagicEdenIngestor();
    const url = 'https://magiceden.io/launchpad/base/the_legend_of_long_wei';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('The Legend of Long Wei');
    expect(template.description).to.contain('Introducing our fun innovative NFT collection');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x3cceeabe8667d357db502066c7af6c1c466c731b');
    expect(mintInstructions.contractMethod).to.equal('mint');
    expect(mintInstructions.priceWei).to.equal('3000000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://img.reservoir.tools/images/v2/base/xodc2gZi85PNDh60glglrXnR8LDj0w9QyoYShUDuVYLnbyoIk98PYWtNDMKLwPRthWjqYgvcw%2BnxjM4bIsCa3rCDLmRME7Ww%2BS1CdOOtHo2AGNC%2Br8l52wlofsJFsGvZDmn39Y5sjq1fI8tCwNGZX90CdWP7rFfWdIFxCYW5E%2B8FZ7HznMrdhvTNr8UekMRzhMXGrs4UCcDOIerEIxtU9w%3D%3D?width=250',
    );

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1718722920502);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL from Open Edition', async function () {
    const ingestor = new MagicEdenIngestor();
    const url = 'https://magiceden.io/launchpad/base/raiinmaker';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Raiinmaker Awakens');
    expect(template.description).to.contain('Introducing “Raiinmaker Awakens,”');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress.toLowerCase()).to.equal(
      '0xa65d7A00670b8CB229d9F9ad5B61cBA9D5ba8F94'.toLowerCase(),
    );
    expect(mintInstructions.contractMethod).to.equal('mint');
    expect(mintInstructions.priceWei).to.equal('0');

    expect(template.featuredImageUrl).to.equal(
      'https://img.reservoir.tools/images/v2/base/xGIQsppdhx9jPELiWEASU%2BbN3QsibEs9QAvK057DL0o2sln4RfX9vbkV1hJsthciKErsVoxNhKgg2VpblmLrOpHPlw%2BEMl2mogPnH01WtHpOWswMgSmIk26fREvxrQTlcqvWw2NkjDSCqw7BDDZQjrItn3y8vcXXtqpNfra5QGQ6zjCaa0RekpvacpfOzrzcQXFbQth15vzGLiKkfbmrKg%3D%3D?width=250',
    );
    expect(template.creator?.walletAddress).to.equal('0x8c6df49bb3f204b22f594136bb22d73a1afa76bc');

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1721821878474);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });
});
