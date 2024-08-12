import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { RodeoIngestor } from '../../src/ingestors/rodeo/index';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { expect } from 'chai';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();

describe('Rodeo', function () {
  basicIngestorTests(
    new RodeoIngestor(),
    resources,
    {
      successUrls: [
        'https://rodeo.club/post/0x68227a4390c15AcEf9265d9B8F65d3fb5cD9f85B/1',
        'https://rodeo.club/post/0x6511cB5ec4dbe28a6F2cbc40d2d1030b6CaBC911/10',
      ],
      failureUrls: ['https://rodeo.club/post/0x68227a4390c15AcEf9265d9B8F65d3fb5cD9f85', 'https://www.transient.xyz/stacks'],
      successContracts: [
        { chainId: 8453, contractAddress: '0x68227a4390c15AcEf9265d9B8F65d3fb5cD9f85B', tokenId: '1' },
        { chainId: 8453, contractAddress: '0x6511cB5ec4dbe28a6F2cbc40d2d1030b6CaBC911', tokenId: '10' },
      ],
      failureContracts: [
        { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
        { chainId: 8453, contractAddress: 'derp' },
      ],
    },
    {
      '8453': '0x1175BA0',
    },
  );
  const testCases = [
    {
      name: 'IMG 0284',
      input: {
        url: 'https://rodeo.club/post/0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA/1?utm_source=twitter&utm_medium=tweet&utm_campaign=hot_ones',
        resources,
        tokenId: '1',
      },
      chainId: 8453,
      expected: {
        name: 'IMG 0284',
        description: null,
        contractAddress: '0x132363a3bbf47E06CF642dd18E9173E364546C99',
        contractMethod: 'mintFromFixedPriceSale',
        contractParams: `[5562, 1, address, "0x18FfAD7FEc51119C55368607e43E6a986edaa831"]`,
        priceWei: '100000000000000',
        featuredImageUrlPattern: /https:\/\/f8n-production-collection-ass.+/,
        availableForPurchaseStart: '2024-08-06T05:47:19',
        availableForPurchaseEnd: '2024-08-07T05:47:12',
        outputContractAddress: '0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA',
      },
    },
  ];
  describe(`createMintTemplateForUrl: Returns a mint template for`, async function () {
    const ingestor = new RodeoIngestor();
    testCases.forEach(({ name, input, expected }) => {
      it(`${name} stack`, async function () {
        const template = await ingestor.createMintTemplateForUrl(input.resources, input.url);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();

        expect(template.name).to.equal(expected.name);
        expect(template.description).to.equal(expected.description);

        const mintInstructions = template.mintInstructions as EVMMintInstructions;

        expect(mintInstructions.contractAddress).to.equal(expected.contractAddress);
        expect(mintInstructions.contractMethod).to.equal(expected.contractMethod);
        expect(mintInstructions.contractParams).to.equal(expected.contractParams);
        expect(mintInstructions.priceWei).to.equal(expected.priceWei);
        expect(template.mintOutputContract?.address).to.equal(expected.outputContractAddress);

        expect(template.featuredImageUrl).to.match(expected.featuredImageUrlPattern);

        expect(template.marketingUrl).to.equal(input.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(new Date(expected.availableForPurchaseStart).getTime());
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(new Date(expected.availableForPurchaseEnd).getTime());
      });
    });
  });

  describe('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
    const ingestor = new RodeoIngestor();
    for (const testCase of testCases) {
      it(`${testCase.name} contract at ${testCase.expected.outputContractAddress}`, async function () {
        const contract = {
          chainId: testCase.chainId,
          contractAddress: testCase.expected.outputContractAddress,
          url: testCase.input.url,
          tokenId: testCase.input.tokenId
        };
        const template = await ingestor.createMintForContract(resources, contract);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();

        expect(template.name).to.equal(testCase.expected.name);
        expect(template.description).to.equal(testCase.expected.description);
        const mintInstructions = template.mintInstructions as EVMMintInstructions;

        expect(mintInstructions.contractAddress).to.equal(testCase.expected.contractAddress);
        expect(mintInstructions.contractMethod).to.equal('mintFromFixedPriceSale');
        expect(mintInstructions.contractParams).to.equal(testCase.expected.contractParams);
        expect(mintInstructions.priceWei).to.equal(testCase.expected.priceWei);

        expect(template.mintOutputContract?.address).to.equal(testCase.expected.outputContractAddress);

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(new Date(testCase.expected.availableForPurchaseStart).getTime());
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(new Date(testCase.expected.availableForPurchaseEnd).getTime());
      });
    }
  });
});
