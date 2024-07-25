import { expect } from 'chai';
import { OpenSeaIngestor } from '../../src/ingestors/opensea';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

describe('opensea', function () {
  basicIngestorTests(
    new OpenSeaIngestor(),
    mintIngestorResources(),
    {
      successUrls: [
        'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview',
        'https://opensea.io/collection/basedghosts/overview',
      ],
      failureUrls: ['https://www.example.com/', 'https://opensea.io/'],
      successContracts: [
        { chainId: 8453, contractAddress: '0x7210587dd3df11efb7d6f34f970b32bf30bbc967' },
        { chainId: 8453, contractAddress: '0x16085fcb829d6be599eaa31ba602b50f454c814c' },

      ],
      failureContracts: [{ chainId: 8453, contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB' }],
    },
    // {
    //   8453: '0xF469C6',
    // },
  );
  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new OpenSeaIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new OpenSeaIngestor();
    const url = 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://opensea.io/collection/quiet-disco-by-jeong-sang-yoon/overview';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
    const ingestor = new OpenSeaIngestor();
    const url = 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal("Parallel OCS '24 Starter Bundle");
    expect(template.description).to.contain('Parallel Starter Bundle includes a Marcolian Assault');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x00005EA00Ac477B1030CE78506496e8C2dE24bf5');
    expect(mintInstructions.contractMethod).to.equal('mintPublic');
    expect(mintInstructions.contractParams).to.equal(
      '["0x7210587dd3df11efb7d6f34f970b32bf30bbc967", "0x0000a26b00c1f0df003000390027140000faa719", "0x0000000000000000000000000000000000000000", 1]',
    );
    expect(mintInstructions.priceWei).to.equal('10000000000000000');

    expect(template.featuredImageUrl).to.contain('cd729f7fce09a974c5dd2588f219393e.png');

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1719424843 * 1000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1725472843 * 1000);
  });

  it('createMintTemplateForUrl: Throws error for non Base mint', async function () {
    const ingestor = new OpenSeaIngestor();
    const url = 'https://opensea.io/collection/quiet-disco-by-jeong-sang-yoon/overview';
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
    const ingestor = new OpenSeaIngestor();
    const url = 'https://twitter.com/';
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
    const ingestor = new OpenSeaIngestor();
    const url = 'https://opensea.io/collection/project-doesnt-exist/overview';
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
    const ingestor = new OpenSeaIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      url: 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview',
      contractAddress: '0x7210587dd3df11efb7d6f34f970b32bf30bbc967',
    };
    const template = await ingestor.createMintForContract(resources, contract);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal("Parallel OCS '24 Starter Bundle");
    expect(template.description).to.contain('Parallel Starter Bundle includes a Marcolian Assault');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x00005EA00Ac477B1030CE78506496e8C2dE24bf5');
    expect(mintInstructions.contractMethod).to.equal('mintPublic');
    expect(mintInstructions.contractParams).to.equal(
      '["0x7210587dd3df11efb7d6f34f970b32bf30bbc967", "0x0000a26b00c1f0df003000390027140000faa719", "0x0000000000000000000000000000000000000000", 1]',
    );
    expect(mintInstructions.priceWei).to.equal('10000000000000000');

    expect(template.featuredImageUrl).to.contain('cd729f7fce09a974c5dd2588f219393e.png');

    expect(template.marketingUrl).to.equal(contract.url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(1719424843 * 1000);
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(1725472843 * 1000);
  });

  it('createMintTemplateForContract: Throws error for a non supported contract', async function () {
    const ingestor = new OpenSeaIngestor();
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
    const ingestor = new OpenSeaIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x0580465d8e39bbe71f964115d2d9cf1783basd9c',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.false;
  });

  it('supportsContract: Returns true for a supported contract', async function () {
    const ingestor = new OpenSeaIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x7210587dd3df11efb7d6f34f970b32bf30bbc967',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.true;
  });

  it('supportsContract: Returns false for a non supported chain', async function () {
    const ingestor = new OpenSeaIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 1,
      contractAddress: '0x0580465d8e39bbe71f964115d2d9cf1783b1839c',
    };

    const supported = await ingestor.supportsContract(resources, contract);
    expect(supported).to.be.false;
  });
});
