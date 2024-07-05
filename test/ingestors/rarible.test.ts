import { expect } from 'chai';
import { RaribleIngestor } from '../../src/ingestors/rarible';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';

describe('rarible', function () {
    it('supportsUrl: Returns false for an unsupported URL', async function () {
        const ingestor = new RaribleIngestor();
        const url = 'https://example.com';
        const resources = mintIngestorResources();
        const result = await ingestor.supportsUrl(resources, url);
         expect(result).to.be.false;
    });
    it('supportsUrl: Returns true for a supported URL', async function () {
        const ingestor = new RaribleIngestor();
        const url = 'https://rarible.com/collection/base/0xDed53B3B4F830C0F8ed39afB3C7f41f7F9cc3cc2/drops';
        const resources = mintIngestorResources();
        const result = await ingestor.supportsUrl(resources, url);
        expect(result).to.be.true;

        const url2 = 'https://rarible.com/collection/base/0x6F01cbe0731B0485522744edDf3cBa734503f276/drops';
        const result2 = await ingestor.supportsUrl(resources, url2);
        expect(result2).to.be.true;
    });
    it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
        const ingestor = new RaribleIngestor();
        const url = 'https://rarible.com/collection/base/0x0F257E0068CBfa1fB160c660144258F9A8766484/drops';
        const resources = mintIngestorResources();
        const template = await ingestor.createMintTemplateForUrl(resources, url);

        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal('Based Bull #');
        expect(template.description).to.contain('The sanctuary where the Based Bull protects the core of our beliefs, waiting to be summoned by the legendary $DEGEN community.');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;

        expect(mintInstructions.contractAddress).to.equal('0x0F257E0068CBfa1fB160c660144258F9A8766484');
        expect(mintInstructions.contractMethod).to.equal('claim');
        expect(mintInstructions.contractParams).to.equal('[address, 1, 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed, 250000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000, 50, 250000000000000000000, 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed, 0x]');
        expect(template.featuredImageUrl).to.equal('ipfs://QmQ6SX7Fk2QC1kRAou4fnHW1WUU7XXppDdjFBbgjpaeKvk/thumb%20(1)%20(1).png');
        expect(template.marketingUrl).to.equal(url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1720184400000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1720486800000);
    });

    it('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        const contract = {
          chainId: 8453,
          url: 'https://rarible.com/collection/base/0xcc3725d7e946d512a6C439E716C7C5A41cCce182/drops',
          contractAddress: '0xcc3725d7e946d512a6C439E716C7C5A41cCce182',
        };
        const template = await ingestor.createMintForContract(resources, contract);
    
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
    
        expect(template.name).to.equal('Stays On | Bstract #');
        expect(template.description).to.contain('\\"Stays On\\" embodies the relentless pursuit of innovation and the thrill of the unknown. Degen culture seamlessly woven into the essence of the piece, celebrating the bold, audacious spirit of the community.\\n\\nThe art was created by physically painting a number of abstract pieces of Art onto canvas, then using digital manipulation, photography, AI and various enhancements to create Bstracts unique style.   ');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0xcc3725d7e946d512a6C439E716C7C5A41cCce182');
        expect(mintInstructions.contractMethod).to.equal('claim');
        expect(mintInstructions.contractParams).to.equal('[address, 1, 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed, 1.1e+21, 0x0000000000000000000000000000000000000000000000000000000000000000, 100, 1.1e+21, 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed, 0x]');
        expect(template.featuredImageUrl).to.equal('ipfs://QmZGwEsVBdSeJZ7kgoenAaewWnF1TxkTC92cgnTtg5FN5k/Degen%203.png');
        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1718888400000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1719784800000);
      });

      it('createMintTemplateForUrl: Throws error if incompatible URL', async function () {
        const ingestor = new RaribleIngestor();
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

    it('createMintTemplateForContract: Throws error for a non supported contract', async function () {
        const ingestor = new RaribleIngestor();
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
        expect(error.message).to.equal('Project not found');
      });

    it('supportsContract: Returns false for a non supported contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        const contract = {
          chainId: 8453,
          contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB',
        };
    
        const supported = await ingestor.supportsContract(resources, contract);
        expect(supported).to.be.false;
      });

    it('supportsContract: Returns true for a supported contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        const contract = {
          chainId: 8453,
          contractAddress: '0x1186c7642E4076EE850Edf107ca618b85C542cC2',
        };
    
        const supported = await ingestor.supportsContract(resources, contract);
        expect(supported).to.be.true;
    });

    it('supportsContract: Returns false for a non supported chain', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        const contract = {
          chainId: 1,
          contractAddress: '0xd6C02F27347293A1798Acb2629B1A7988018832e',
        };
    
        const supported = await ingestor.supportsContract(resources, contract);
        expect(supported).to.be.false;
      });
})