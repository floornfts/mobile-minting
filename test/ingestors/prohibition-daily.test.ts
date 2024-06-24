import { expect } from 'chai';
import { ProhibitionDailyIngestor } from '../../src/ingestors/prohibition-daily';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('prohibition-daily', function () {
    basicIngestorTests(new ProhibitionDailyIngestor(), resources, {
        successUrls: [
            'https://daily.prohibition.art/mint/8453/0x4680c6a96941a977feaf71e503f3d0409157e02f'
        ],
        failureUrls: [
            'https://daily.prohibition.art/',
            'https://daily.prohibition.art/mint/8453/0x4680c6a96941a977feaf71e503f3d0409157e02f/extra'
        ],
        successContracts: [
            { chainId: 8453, contractAddress: '0x4680c6a96941a977feaf71e503f3d0409157e02f' }
        ],
        failureContracts: [
            { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
            { chainId: 8453, contractAddress: 'derp' }
        ]
    });
    it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
        const ingestor = new ProhibitionDailyIngestor();
        const url = 'https://daily.prohibition.art/mint/8453/0x4680c6a96941a977feaf71e503f3d0409157e02f';
        
        const template = await ingestor.createMintTemplateForUrl(resources, url);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal('Equilibrium');
        expect(template.description).to.equal('An animated mixed media piece inspired by the beautiful harmony between humanity and nature.');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x4680c6a96941a977feaf71e503f3d0409157e02f');
        expect(mintInstructions.contractMethod).to.equal('mint');
        expect(mintInstructions.contractParams).to.equal('[address, 1]');
        expect(mintInstructions.priceWei).to.equal('2300000000000000');

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1718812800000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1718899140000);
    });
    it('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
        const ingestor = new ProhibitionDailyIngestor();
        const contract = {
            chainId: 8453,
            contractAddress: '0x4680c6a96941a977feaf71e503f3d0409157e02f',
            url: 'https://daily.prohibition.art/mint/8453/0x4680c6a96941a977feaf71e503f3d0409157e02f'
        };
        
        const template = await ingestor.createMintForContract(resources, contract);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();
        
        expect(template.name).to.equal('Equilibrium');
        expect(template.description).to.equal('An animated mixed media piece inspired by the beautiful harmony between humanity and nature.');
        const mintInstructions = template.mintInstructions as EVMMintInstructions;
        
        expect(mintInstructions.contractAddress).to.equal('0x4680c6a96941a977feaf71e503f3d0409157e02f');
        expect(mintInstructions.contractMethod).to.equal('mint');
        expect(mintInstructions.contractParams).to.equal('[address, 1]');
        expect(mintInstructions.priceWei).to.equal('2300000000000000');

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1718812800000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1718899140000);
    });
});