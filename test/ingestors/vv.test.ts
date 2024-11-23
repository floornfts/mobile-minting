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
    failureContracts: [],
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

    expect(template.name).to.equal('Artifacts');
    expect(template.description).to.contain('To mint is a human right.');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0xcb52f0fe1d559cd2869db7f29753e8951381b4a3');
    expect(mintInstructions.contractMethod).to.equal('mint');
    expect(mintInstructions.contractParams).to.equal('[1, quantity]');

    // Gas price at block #21167990
    expect(mintInstructions.priceWei).to.equal(String(60000 * 39874264171));

    expect(template.creator?.name).to.equal('visualizevalue.eth');
    expect(template.creator?.walletAddress).to.equal('0xc8f8e2F59Dd95fF67c3d39109ecA2e2A017D4c8a');

    // Image is stored onchain as an svg
    expect(template.featuredImageUrl).to.contain('<svg width="64" height="64"');

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-11-12T02:21:23+02:00'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2024-11-13T02:21:23+02:00'));
  });
});
