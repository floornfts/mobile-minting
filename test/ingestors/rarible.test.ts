import { expect } from 'chai';
import { RaribleIngestor } from '../../src/ingestors/rarible';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

describe('rarible', function () {
    this.timeout(60000);

    const chainId = 8453;
    const ITER_IDX = 0;
    const supportedUrlsWithBlock = [
      {
        url: 'https://rarible.com/collection/base/0x3e28E3ad52f64E67934D844fD3265f16c01E71D1/drops', 
        block: 16500757 
      },
      {
        url: 'https://rarible.com/collection/base/0x54DcE142f2a3064c2CEF6CDebdCdb73DBd2f57f3/drops', 
        block: 15177765 
      },
      {
        url: 'https://rarible.com/collection/base/0x0d3649f403780676F65e2B4A5CCD4F14EdDFaEA3/drops', 
        block: 14926038 
      },
    ]
    const supportedUrls = [
      supportedUrlsWithBlock[ITER_IDX].url,
    ]
    const notSupportedUrls = [
      'https://example.com',
      'https://basescan.org',
      'https://etherscan.org',
      'https://farcaster.xyz',
      'https://opensea.io',
    ] 
    const suppContract = [
      { chainId, contractAddress: '0x1F4dcFc919863324887225dD4E7E92112dff64D9'},
      { chainId, contractAddress: '0x968ca01b5C32234F4d6Bfd44fF079BE14789bA10'},
      { chainId, contractAddress: '0x2F35A1080b1c4cC74D0203fe12c2494291E17153'},
      { chainId, contractAddress: '0x2F35A1080b1c4cC74D0203fe12c2494291E17153'},
      { chainId, contractAddress: '0x0F257E0068CBfa1fB160c660144258F9A8766484'},
    ]
    const notSuppContract = [
      { chainId, contractAddress: '0x6140F00e4Ff3936702E68744f2b5978885464cbB'},
      { chainId, contractAddress: '0x9EF36A5969C71E41fdFEc2090F11D96d95812cD1'},
      { chainId, contractAddress: '0x3B8114EDC4A43492d2543130d2a75d7558afc1B9'},
      { chainId, contractAddress: '0x5c9E9B603eA654734e5BebE78CC230f16BD21d2b'},
      { chainId, contractAddress: '0x16144DeFf95a67147b96B4bC2c4B5C4fA3cCe055'},
    ]    
    const suppContractAddrNotBase = [
      '0xf0315618b07b35262a181dfa277f0dc254c283c0',
      '0x1e878f25c11b92a90Ca00daa651E4A041fc14cae',
      '0x1e878f25c11b92a90Ca00daa651E4A041fc14cae',
      '0x6f20bE53858C299F2e43E0DCB8aDd9deD169360A',
      '0xa79030c95de01C1b92352755dDc849cDdFdb5915'
    ]
    basicIngestorTests(
      new RaribleIngestor(),
      mintIngestorResources(),
      {
        successUrls: supportedUrls,
        failureUrls: notSupportedUrls,
        successContracts: suppContract,
        failureContracts: notSuppContract,
      },
      {
        8453: `0x${supportedUrlsWithBlock[ITER_IDX].block.toString(16)}`,
      }
    );

    it('supportsUrl: Returns false for an unsupported URL', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        for (const url of notSupportedUrls) {
          const result = await ingestor.supportsUrl(resources, url);
          expect(result).to.be.false;
        }
    });
    it('supportsUrl: Returns true for a supported URL', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();

        for (const url of supportedUrls) {
          const result = await ingestor.supportsUrl(resources, url);
          expect(result).to.be.true;
        }
    });
    it('supportsContract: Returns false for a unsupported contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        for (const contract of notSuppContract) {
          const result = await ingestor.supportsContract(resources, contract);
          expect(result).to.be.false;
        }
    });
    it('supportsContract: Returns true for a supported contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        for (const contract of suppContract) {
          const result = await ingestor.supportsContract(resources, contract);
          expect(result).to.be.true;
        }
    });
    it('supportsContract: Returns false for a non base chain supported contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        for (const addr of suppContractAddrNotBase) {
          const contract = {
            chainId,
            contractAddress: addr,
          };
          const result = await ingestor.supportsContract(resources, contract);
          expect(result).to.be.false;
        }
    })
    it('createMintForContract: Returns a mint template for a supported base contract', async function () {
        const ingestor = new RaribleIngestor();
        const resources = mintIngestorResources();
        const addressIdx = 0;
        const contract = {
          chainId: chainId,
          url: `https://rarible.com/collection/base/${suppContract[addressIdx].contractAddress}/drops`,
          contractAddress: suppContract[addressIdx].contractAddress
        }
        const template = await ingestor.createMintForContract(resources, contract);
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();

        expect(template.name).to.equal('BASED DEGEN');
        expect(template.description).to.contain('Watch out, Degens in the house!');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        expect(mintInstructions.contractAddress).to.equal('0x1F4dcFc919863324887225dD4E7E92112dff64D9');
        expect(mintInstructions.contractMethod).to.equal('claim');
        expect(mintInstructions.contractParams).to.equal('[address, 1, "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", "425000000000000000000", [["0x0000000000000000000000000000000000000000000000000000000000000000"], 0, "425000000000000000000", "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed"], "0x"]');
        expect(template.featuredImageUrl).to.equal('ipfs://bafybeiaviu3k3ohx7kzouz5q4i3h5eccivzckaldiywq7wepujg4vuo4ga/new.gif');
        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.creator?.name).to.equal('ZafGod.eth');
        expect(template.creator?.imageUrl).to.equal('https://ipfs.raribleuserdata.com/ipfs/QmaM3Lvd8kiwCekq6cuhWh5SA7RpbN2upQM1R6QoefWHuS');
        expect(template.creator?.description).to.equal('Artist-- 👽 \nJoin the club on discord https://discord.gg/muHgNMa9XH');
        expect(template.creator?.websiteUrl).to.equal('https://rarible.com/artshop');
        expect(template.creator?.walletAddress).to.equal('0xe744D23107c9C98df5311ff8C1C8637Ec3ECF9F3');
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1721221200000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1721480400000);
    });
    it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
      const ingestor = new RaribleIngestor();
      const resources = mintIngestorResources();
      const addressIdx = 1;
      const contract = {
        chainId: chainId,
        url: `https://rarible.com/collection/base/${suppContract[addressIdx].contractAddress}/drops`,
        contractAddress: suppContract[addressIdx].contractAddress
      }
      const template = await ingestor.createMintTemplateForUrl(resources, contract.url);
      const builder = new MintTemplateBuilder(template);
      builder.validateMintTemplate();
        
      expect(template.name).to.equal('Project Phäros');
      expect(template.description).to.contain("Founded by Matt Monday, Project Phäros is a collection of 10K PFP-style NFTs that place a high focus on culture and lore as a means to create a series of products and experiences for not only the holders, but the participants in the culture the community stands behind. In collaboration with Monday, artist PSSYPPL has created and illustrated the trait base for all of the individual NFTs, with influences from anime, streetwear, rap music, gaming and sneaker culture.\n\nProject Phäros offers access to an immersive experience that gives holders a peak into the brand's world building by way of physical products. Our first offering was Koodos.xyz in 2022. \"Koodos\" is an album and art piece all in one showcasing augmented reality, artwork, a comic, and actual popcorn into one complete experience.\n\nIn addition to digital products Phäros offers \"Cultura\", a music festival held in the beautiful city of Charleston, SC. Powered by our parent company S.W.I.M. LLC, the festival features a variety of Hip Hop, RnB, & Dance musicians from across the globe. This event is open to the public but offered to Phäros holders as a premium VIP ticket.\n\nGoing forward our intentions are to build out the world of Phäros by sticking to a roadmap that continues to build upon the foundation established strictly in culture and culture only.");
      const mintInstructions = template.mintInstructions as EVMMintInstructions;
      expect(mintInstructions.contractAddress).to.equal('0x968ca01b5C32234F4d6Bfd44fF079BE14789bA10');
      expect(mintInstructions.contractMethod).to.equal('claim');
      expect(mintInstructions.contractParams).to.equal('[address, 1, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "25650000000000000", [["0x0000000000000000000000000000000000000000000000000000000000000000"], 0, "25650000000000000", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"], "0x"]');
      expect(template.featuredImageUrl).to.equal('ipfs://bafybeiak3uyymizjs3jhwn4ld5zjverl3dlyxeneleh5ppn56l37sj76ue/Project_Pharos_Logo_(BW).png');
      expect(template.marketingUrl).to.equal(contract.url);
      expect(template.creator?.name).to.equal('Matt Monday');
      expect(template.creator?.imageUrl).to.equal('');
      expect(template.creator?.description).to.equal('Matt Monday is an artist & creative director. ');
      expect(template.creator?.websiteUrl).to.equal('https://rarible.com/musebymonday');
      expect(template.creator?.walletAddress).to.equal('0xa48F751B466706F84746D23f3AeC7357Ed20000D');
      expect(template.availableForPurchaseStart?.getTime()).to.equal(1720800000000);
      expect(template.availableForPurchaseEnd?.getTime()).to.equal(1722430800000);
    });
    it('createMintTemplateForUrl: Throws error if incompatible URL', async function () {
        const ingestor = new RaribleIngestor();
        const url = 'https://twitter.com/yungwknd';
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
});



