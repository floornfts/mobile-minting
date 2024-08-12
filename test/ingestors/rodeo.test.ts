import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { RodeoIngestor } from '../../src/ingestors/rodeo/index';
import { TransientIngestor } from '../../src/ingestors/transient-base/index';
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
        'https://rodeo.club/post/0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA/1?utm_source=twitter&utm_medium=tweet&utm_campaign=hot_ones',
      ],
      failureUrls: ['https://rodeo.club/post/0x68227a4390c15AcEf9265d9B8F65d3fb5cD9f85B/1999', 'https://www.transient.xyz/stacks'],
      successContracts: [
        // { chainId: 8453, contractAddress: '0x6511cB5ec4dbe28a6F2cbc40d2d1030b6CaBC911' },
        // { chainId: 8453, contractAddress: '0x6511cB5ec4dbe28a6F2cbc40d2d1030b6CaBC911' },
      ],
      failureContracts: [
        // { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
        // { chainId: 8453, contractAddress: 'derp' },
      ],
    },
    // {
    //   // '8453': '0x1081832',
    // },
  );
  const testCases = [
    {
      name: 'IMG 0284',
      input: {
        url: 'https://rodeo.club/post/0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA/1?utm_source=twitter&utm_medium=tweet&utm_campaign=hot_ones',
        resources,
      },
      chainId: 8453,
      expected: {
        name: 'https://rodeo.club/post/0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA/1?utm_source=twitter&utm_medium=tweet&utm_campaign=hot_ones',
        description: null,
        contractAddress: '0x132363a3bbf47E06CF642dd18E9173E364546C99',
        contractMethod: 'mintFromFixedPriceSale',
        contractParams: `[5562, 1, address, "0x18FfAD7FEc51119C55368607e43E6a986edaa831"]`,
        priceWei: 0,
        featuredImageUrlPattern: /https:\/\/ipfs.io\/ipfs\/.+\/media/,
        availableForPurchaseStart: '2024-08-06T05:47:19',
        availableForPurchaseEnd: '2024-08-07T05:47:12',
        outputContractAddress: '0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA',
      },
    },
  ];
  describe(`createMintTemplateForUrl: Returns a mint template for`, async function () {
    const ingestor = new TransientIngestor();
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
        expect(template.availableForPurchaseStart?.getTime()).to.equal(expected.availableForPurchaseStart);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(expected.availableForPurchaseEnd);
      });
    });
  });

  describe('createMintTemplateForContract: Returns a mint template for a supported contract', async function () {
    const ingestor = new TransientIngestor();
    for (const testCase of testCases) {
      it(`${testCase.name} contract at ${testCase.expected.outputContractAddress}`, async function () {
        const contract = {
          chainId: testCase.chainId,
          contractAddress: testCase.expected.outputContractAddress,
          url: testCase.input.url,
        };
        const template = await ingestor.createMintForContract(resources, contract);

        // Verify that the mint template passed validation
        const builder = new MintTemplateBuilder(template);
        builder.validateMintTemplate();

        expect(template.name).to.equal(testCase.expected.name);
        expect(template.description).to.equal(testCase.expected.description);
        const mintInstructions = template.mintInstructions as EVMMintInstructions;

        expect(mintInstructions.contractAddress).to.equal(testCase.expected.contractAddress);
        expect(mintInstructions.contractMethod).to.equal('purchase');
        expect(mintInstructions.contractParams).to.equal(testCase.expected.contractParams);
        expect(mintInstructions.priceWei).to.equal(testCase.expected.priceWei);

        expect(template.mintOutputContract?.address).to.equal(testCase.expected.outputContractAddress);

        expect(template.featuredImageUrl?.length).to.be.greaterThan(0);

        expect(template.marketingUrl).to.equal(contract.url);
        expect(template.availableForPurchaseStart?.getTime()).to.equal(testCase.expected.availableForPurchaseStart);
        expect(template.availableForPurchaseEnd?.getTime()).to.equal(testCase.expected.availableForPurchaseEnd);
      });
    }
  });
});
