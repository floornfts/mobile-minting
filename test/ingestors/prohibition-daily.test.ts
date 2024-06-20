import { expect } from 'chai';
import { ProhibitionDailyIngestor } from '../../src/ingestors/prohibition-daily';
import { mintIngestorResources } from '../resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';

describe('prohibition-daily', function () {
    it('supportsUrl: Returns false for an unsupported URL', async function () {
        const ingestor = new ProhibitionDailyIngestor();
        const url = 'https://example.com';
        const result = await ingestor.supportsUrl(url)
        expect(result).to.be.false;
    });
    it('supportsUrl: Returns true for a supported URL', async function () {
        const ingestor = new ProhibitionDailyIngestor();
        const url = 'https://daily.prohibition.art/mint/8453/0x4680c6a96941a977feaf71e503f3d0409157e02f';
        const result = await ingestor.supportsUrl(url)
        expect(result).to.be.true;
    });
    it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
        const ingestor = new ProhibitionDailyIngestor();
        const url = 'https://daily.prohibition.art/mint/8453/0x4680c6a96941a977feaf71e503f3d0409157e02f';
        const resources = mintIngestorResources();
        const template = await ingestor.createMintTemplateForUrl(url, resources);

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

        expect(template.originalUrl).to.equal(url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(1718812800000);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(1718899140000);
    });
});