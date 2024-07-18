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
            'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview'
        ],
        failureUrls: [
            'https://opensea.io/collection/',
            'https://notopensea.io/collection/parallel-ocs-24-starter-bundle/overview'
        ],
        successContracts: [
            { chainId: 8453, contractAddress: '0x7210587dd3df11efb7D6f34F970B32Bf30BBc967' }
        ],
        failureContracts: [
            { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
            { chainId: 8453, contractAddress: 'derp' }
        ]
    });
    it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
        const ingestor = new OpenSeaIngestor();
        const url = 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview';
        
        const template = await ingestor.createMintTemplateForUrl(resources, url);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal("Parallel OCS '24 Starter Bundle");
        expect(template.description).to.equal('Parallel Starter Bundle includes a Marcolian Assault Training Concept Art Cardback and a random Parallel Starter Pack of NFTs allowing you to play to win. As a bonus, receive five AP card packs when you download the game. \r\n\r\nParallel is a sci-fi based competitive card game where players build decks and face off, bank energy, and build armies to decide the fate of humanity.\r\n\r\nClaim your free card back and purchase a bundle to jump start your playing journey.');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x7210587dd3df11efb7d6f34f970b32bf30bbc967');
        expect(mintInstructions.contractMethod).to.equal('mintSeaDrop');
        expect(mintInstructions.contractParams).to.equal('[address, 1]');
        expect(mintInstructions.priceWei).to.equal('10750000000000000');

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1719424843000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1725472843000);
    });
    it('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
        const ingestor = new OpenSeaIngestor();
        const contract = {
            chainId: 8453,
            contractAddress: '0x7210587dd3df11efb7D6f34F970B32Bf30BBc967',
            url: 'https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview'
        };
        
        const template = await ingestor.createMintForContract(resources, contract);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal("Parallel OCS '24 Starter Bundle");
        expect(template.description).to.equal('Parallel Starter Bundle includes a Marcolian Assault Training Concept Art Cardback and a random Parallel Starter Pack of NFTs allowing you to play to win. As a bonus, receive five AP card packs when you download the game. \r\n\r\nParallel is a sci-fi based competitive card game where players build decks and face off, bank energy, and build armies to decide the fate of humanity.\r\n\r\nClaim your free card back and purchase a bundle to jump start your playing journey.');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x7210587dd3df11efb7D6f34F970B32Bf30BBc967');
        expect(mintInstructions.contractMethod).to.equal('mintSeaDrop');
        expect(mintInstructions.contractParams).to.equal('[address, 1]');
        expect(mintInstructions.priceWei).to.equal('10750000000000000');

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1719424843000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1725472843000);
    });
});