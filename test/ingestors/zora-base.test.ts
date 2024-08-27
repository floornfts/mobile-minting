import { expect } from 'chai';

import { ZoraIngestor } from '../../src/ingestors/zora-base';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { mintIngestorResources } from '../../src/lib/resources';

describe('zora-base', function () {

  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new ZoraIngestor();
    const url = 'https://example.com';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new ZoraIngestor();
    const url = 'https://zora.co/collect/base:0x1e1ad3d381bc0ccea5e44c29fb1f7a0981b97f37/1';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://zora.co/collect/base:0x1e1ad3d381bc0ccea5e44c29fb1f7a0981b97f37/1';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });

  it('createMintTemplateForUrl: Throws error if incompatible URL', async function () {
    const ingestor = new ZoraIngestor();
    const url = 'https://twitter.com/Nithinkd567';
    const resources = mintIngestorResources();
    let error: any;

    try {
      await ingestor.createMintTemplateForUrl(resources, url);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Incompatible URL');
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
    const ingestor = new ZoraIngestor();
    const url = 'https://zora.co/collect/base:0x923b382f3205c26efe706c53d69f71f0817aa954/1';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Vitalik: An Ethereum Story (Official Trailer)');

    const description = "Trailer mint is now available! After three years of filming. 28 cities. 15 countries. We can finally share this feature documentary about Vitalik and Ethereum’s community of builders. Thank you to everyone who made it possible.  \n\nThe film showcases the humanity and heart behind this technology. And it’s only fitting that we release the film and trailer onchain, to put the power in the hands of the people, not big distributors. \n\nWE NEED YOUR HELP, to share this film with community members, the crypto-curious, and skeptics alike. Please mint the trailer (can be minted multiple times), and share it with your community. Every mint will help the film reach audiences everywhere, while also supporting Protocol Guild. Think of theatrical events globally. A streaming release. A short film series of “Ethereum Stories.” You can read our detailed plan at EthereumFilm.xyz.\n\nSEE THE FULL FILM by minting a ticket to stream it on Zora or by getting a ticket to an in person premiere! All at Ethereumfilm.xyz. \n\nBIG THANKS to Zora, Base, Bonfire, and the entire community of builders and enthusiasts who helped make this film. Thanks to you, it could remain entirely independent without pressure from major media companies to sensationalize the story.";

    expect(template.description).to.equal(description);

    const mintInstructions = template.mintInstructions as EVMMintInstructions;
    expect(mintInstructions.contractAddress).to.equal('0x923b382f3205c26efe706c53d69f71f0817aa954');
    expect(mintInstructions.contractMethod).to.equal('mintWithRewards');
    expect(mintInstructions.contractParams).to.equal('["0x04e2516a2c207e84a1839755675dfd8ef6302f0a",1,1,encodedAddress,"0xfda84eada14805bebd3583bba087769af91bbcfc"]');
    expect(mintInstructions.priceWei).to.equal('777000000000000');
    expect(template.featuredImageUrl).to.equal('ipfs://bafybeieq6bbknciskd4tfwq4gcnqrfha26crmmleld3xf2vtblq5aoofvu');

    expect(template.availableForPurchaseStart?.getTime()).to.equal(1721701059000);
  });

  it('createMintTemplateForContract: Throws error for a non-supported contract', async function () {
    const ingestor = new ZoraIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB',
    };

    let error: any;
    try {
      await ingestor.createMintForContract(resources, contract);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Missing required data');
  });

});

