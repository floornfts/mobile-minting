import { expect } from 'chai';
import { FxHashIngestor } from '../../src/ingestors/fxhash';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

describe('fxhash', function () {

  basicIngestorTests(
    new FxHashIngestor(),
    mintIngestorResources(),
    {
      successUrls: [
        'https://fxhash.xyz/generative/slug/allegro',
        'https://fxhash.xyz/generative/slug/graphomania',
        'https://www.fxhash.xyz/generative/slug/the-space-in-between'
      ],
      failureUrls: ['https://example.com'],
      successContracts: [{
        chainId: 8453,
        contractAddress: '0x914cf2d92b087C9C01a062111392163c3B35B60e'
      }],
      failureContracts: [
        {
          chainId: 8453,
          contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB'
        }
      ]
    },
    {
      // 8453: '0x107A60C'
    }
  );

  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });
  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://www.fxhash.xyz/generative/slug/1x4-shape-study';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://fxhash.xyz/generative/slug/allegro';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });
  it('createMintTemplateForUrl: Returns a mint template for a supported URL with frame contract', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://fxhash.xyz/generative/slug/allegro';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

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

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1715358000000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with fixed price contract', async function () {
    const ingestor = new FxHashIngestor();
    const url = 'https://fxhash.xyz/generative/slug/graphomania';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

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
    expect(template.creator?.name).to.equal('P|mll');
    expect(template.creator?.imageUrl).to.not.be.empty;
    expect(template.creator?.walletAddress).to.equal('0x6eF478BeFe3f7Ae12E6357311C3826a865626643');

    expect(template.marketingUrl).to.equal(url);
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
      await ingestor.createMintTemplateForUrl(resources, url);
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
      await ingestor.createMintTemplateForUrl(resources, url);
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
      await ingestor.createMintTemplateForUrl(resources, url);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Project not found');
  });

  it('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
    const ingestor = new FxHashIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      url: 'https://fxhash.xyz/generative/slug/allegro',
      contractAddress: '0x914cf2d92b087C9C01a062111392163c3B35B60e',
    };
    const template = await ingestor.createMintForContract(resources, contract);

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

    expect(template.marketingUrl).to.equal(contract.url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1715358000000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1893456000000);
  });

  it('createMintTemplateForContract: Throws error for a non supported contract', async function () {
    const ingestor = new FxHashIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB',
    };

    // It should throw an error
    let error: any;
    try {
      await ingestor.createMintForContract(resources, contract);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Project not found');
  });

  it('supportsContract: Returns false for a non supported contract', async function () {
    const ingestor = new FxHashIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.false;
  });

  it('supportsContract: Returns true for a supported contract', async function () {
    const ingestor = new FxHashIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x914cf2d92b087C9C01a062111392163c3B35B60e',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.true;
  });

  it('supportsContract: Returns false for a non supported chain', async function () {
    const ingestor = new FxHashIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 1,
      contractAddress: '0x914cf2d92b087C9C01a062111392163c3B35B60e',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.false;
  });
});
