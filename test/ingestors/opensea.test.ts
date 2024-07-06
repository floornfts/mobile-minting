import { expect } from 'chai';
import { OpenSeaIngestor } from '../../src/ingestors/opensea';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('opensea', function () {
    basicIngestorTests(new OpenSeaIngestor(), resources, {
        successUrls: [
            // 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview'
        ],
        failureUrls: [
            // 'https://opensea.com/collection/parallel-ocs-24-starter-bundle/overview',
            // 'https://opensea.io/collection/azuki-bundle/'
        ],
        successContracts: [
            { chainId: 8453, contractAddress: '0x7210587dd3df11efb7d6f34f970b32bf30bbc967' }
        ],
        failureContracts: [
            { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
            { chainId: 8453, contractAddress: 'derp' }
        ]
    });
    it('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
        const ingestor = new OpenSeaIngestor();
        const contract = {
            chainId: 8453,
            contractAddress: '0x7210587dd3df11efb7d6f34f970b32bf30bbc967',
            url: 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview'
        };
        
        const template = await ingestor.createMintForContract(resources, contract);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal('Parallel OCS 24’ Starter Bundle');
        expect(template.description).to.equal("Parallel Onchain Summer 24' Starter Bundle proof of participation.");
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x7210587dd3df11efb7d6f34f970b32bf30bbc967');
        expect(mintInstructions.contractMethod).to.equal('mintSeaDrop');
        expect(mintInstructions.contractParams).to.equal('[address, 1]');
        expect(mintInstructions.priceWei).to.equal('10750000000000000');

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal('https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview');
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1719424843000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1725472843000);
    });
});