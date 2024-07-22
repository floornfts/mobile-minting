import { expect } from 'chai';

import { ZoraIngestor } from '../../src/ingestors/zora';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { mintIngestorResources } from '../../src/lib/resources';


describe('zora-base-mint', function () {

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
        const url = 'https://zora.co/collect/base:0x1e1ad3d381bc0ccea5e44c29fb1f7a0981b97f37/1';
        // const url = 'https://zora.co/collect/base:0xeb334f3fbd826ce99f1e74d7d074fbe351f4157a/1';
        const resources = mintIngestorResources();
        const template = await ingestor.createMintTemplateForUrl(resources,url);
    //     // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        expect(template.name).to.equal('Base x Doodles');
        const description='Commemorating Doodles migration of the Stoodio to Base this July 2024.\n' +
    '\n' +
    "Note: All mints or purchases of this digital collectible are subject to Doodles' Digital Collectibles Media License Agreement (located at https://doodles.app/digital-collectibles-media-license-agreement) and Doodles' Terms of Service (located at https://doodles.app/terms)."
    expect(template.description).to.equal(description);
     const  mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x1e1ad3d381bc0ccea5e44c29fb1f7a0981b97f37');
        expect(mintInstructions.contractMethod).to.equal('mintWithRewards');
        expect(mintInstructions.contractParams).to.equal('["0x04e2516a2c207e84a1839755675dfd8ef6302f0a", 1, 1, encodedAddress, "0xe1c5fc12c0c5e05bbfd499fa2074c758a4391285"]');
        expect(mintInstructions.priceWei).to.equal('0.000777');
        
        expect(template.featuredImageUrl).to.equal('ipfs://bafybeicyqd4qdb74hm3e6vevdhpjmklhkjtdazwdptgpdbh4hprcsi7uea');
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1718202693000);
        expect(template. liveDate?.getTime()).to.greaterThan(1718202693000);
    });
});


it('createMintTemplateForContract: Throws error for a non supported contract', async function () {
    const ingestor = new ZoraIngestor();
    const resources = mintIngestorResources();
    const contract = {
      chainId: 8453,
      contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB',
    };

    // It should throw an error; tokenId is missing
    let error: any;
    try {
      await ingestor.createMintForContract(resources, contract);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Missing required data');
  });