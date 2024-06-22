import { expect } from 'chai';
import { FxHashIngestor } from '../../src/ingestors/fxhash';
import { mintIngestorResources } from '../resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';

describe('fxhash', function () {
  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://example.com';
    const result = await ingestor.supportsUrl(url);
    expect(result).to.be.false;
  });
  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://www.fxhash.xyz/generative/slug/1x4-shape-study';
    const result = await ingestor.supportsUrl(url);
    expect(result).to.be.true;

    const url2 = 'https://fxhash.xyz/generative/slug/allegro';
    const result2 = await ingestor.supportsUrl(url2);
    expect(result2).to.be.true;
  });
  it('createMintTemplateForUrl: Returns a mint template for a supported URL with frame contract', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://fxhash.xyz/generative/slug/allegro';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(url, resources);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Allegro');
    expect(template.description).to.contain('Allegro from Pixelwank');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x6e625892C739bFD960671Db5544E260757480725');
    expect(mintInstructions.contractMethod).to.equal('buy');
    expect(mintInstructions.contractParams).to.equal('["0x914cf2d92b087C9C01a062111392163c3B35B60e", 1, 1, address]');
    expect(mintInstructions.priceWei).to.equal('4200000000000000');

    expect(template.featuredImageUrl).to.equal('ipfs://Qmc9eKhAkQvt1mXq1pD5FP9ZnprBNuU2USq5rELKVdb9uf');

    expect(template.originalUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1715358000000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with fixed price contract', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://fxhash.xyz/generative/slug/graphomania';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(url, resources);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('graphomania');
    expect(template.description).to.contain('And maybe:');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x4bDcaC532143d8d35ed759189EE22E3704580b9D');
    expect(mintInstructions.contractMethod).to.equal('buy');
    expect(mintInstructions.contractParams).to.equal('["0x755625dEfD0f1Bb90850d533f30176aa7a425f6E", 1, 1, address]');
    expect(mintInstructions.priceWei).to.equal('500000000000000');

    expect(template.featuredImageUrl).to.equal('ipfs://QmYV4LXoz18youcW7zREFFFVpPf6Tn1j4QRzmTi1cSPinb');

    expect(template.originalUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1718983800000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });

  it('createMintTemplateForUrl: Throws error if the mint for fxhash is on mainnet or tezos', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://fxhash.xyz/generative/slug/1x4-shape-study';
    const resources = mintIngestorResources();

    // It should throw an error
    let error: any;

    try {
      await ingestor.createMintTemplateForUrl(url, resources);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Chain not supported');
  });

  it('createMintTemplateForUrl: Throws error if incompatible URL', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://twitter.com/yungwknd';
    const resources = mintIngestorResources();

    // It should throw an error
    let error: any;

    try {
      await ingestor.createMintTemplateForUrl(url, resources);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Incompatible URL');
  });

  it('createMintTemplateForUrl: Throws error if non-existent project', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://fxhash.xyz/generative/slug/project-doesnt-exist';
    const resources = mintIngestorResources();

    // It should throw an error
    let error: any;

    try {
      await ingestor.createMintTemplateForUrl(url, resources);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Project not found');
  });
});
