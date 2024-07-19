import { EVMMintInstructions, SolanaMintInstructions } from '../../src/lib/types/mint-template';

import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { TransientIngestor } from '../../src/ingestors/transient-base/index';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { expect } from 'chai';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();

describe('Transient', function () {
    basicIngestorTests(new TransientIngestor(), resources, {
        successUrls: [
            'https://www.transient.xyz/stacks/kansas-smile'
        ],
        failureUrls: [
            'https://www.transient.xyz/stacks/kansas-smiles',
            'https://www.transient.xyz/stacks'
        ],
        successContracts: [
            { chainId: 8453, contractAddress: '0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8' }
        ],
        failureContracts: [
            { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
            { chainId: 8453, contractAddress: 'derp' }
        ]
    });
    it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
        const ingestor = new TransientIngestor();
        const url = 'https://www.transient.xyz/stacks/kansas-smile';
        
        const template = await ingestor.createMintTemplateForUrl(resources, url);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal('Kansas Smile');
        expect(template.description).to.equal("'Kansas Smile' explores how our longing for the past connects with modern technology. It shows how digital tools can recreate and reimagine the past, allowing us to experience nostalgia in new ways through AI.\n\nExhibited at 'Digital Dreams' Kansas City 2024, part of the Digital Collage exhibition.\n\n(Analog and digital processes with AI)");
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8');
        expect(mintInstructions.contractMethod).to.equal('purchase');
        expect(mintInstructions.contractParams).to.equal('["address", 1, 1, address]');
        expect(mintInstructions.priceWei).to.equal('20000000000000000');

        expect(template.featuredImageUrl?.length).to.be.matches(/https:\/\/ipfs.io\/ipfs\/.+\/media/);

        expect(template.marketingUrl).to.equal(url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1717777800000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(3294577800000);
    });
    
    it('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
        const ingestor = new TransientIngestor();
        const contract = {
            chainId: 8453,
            contractAddress: '0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8',
            url: 'https://www.transient.xyz/stacks/kansas-smile'
        };
        
        const template = await ingestor.createMintForContract(resources, contract);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal('Kansas Smile');
        expect(template.description).to.equal("'Kansas Smile' explores how our longing for the past connects with modern technology. It shows how digital tools can recreate and reimagine the past, allowing us to experience nostalgia in new ways through AI.\n\nExhibited at 'Digital Dreams' Kansas City 2024, part of the Digital Collage exhibition.\n\n(Analog and digital processes with AI)");
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8');
        expect(mintInstructions.contractMethod).to.equal('purchase');
        expect(mintInstructions.contractParams).to.equal('["address", 1, 1, address]');
        expect(mintInstructions.priceWei).to.equal('20000000000000000');
        const mintAddress = template.mintInstructions as SolanaMintInstructions;
        
        expect(mintAddress).to.equal('0x32953d7ae37b05075b88c34e800ae80c1cb1b794');

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1717777800000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(3294577800000);
    });
});