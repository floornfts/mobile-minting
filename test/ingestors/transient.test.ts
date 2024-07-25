import { EVMMintInstructions, SolanaMintInstructions } from '../../src/lib/types/mint-template';

import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { TransientIngestor } from '../../src/ingestors/transient-base/index';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { expect } from 'chai';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();

describe('Transient', function () {
  basicIngestorTests(
    new TransientIngestor(),
    resources,
    {
      successUrls: [
        'https://www.transient.xyz/stacks/kansas-smile',
        'https://www.transient.xyz/stacks/16384',
        'https://www.transient.xyz/stacks/volumina-8',
      ],
      failureUrls: ['https://www.transient.xyz/stacks/kansas-smiles', 'https://www.transient.xyz/stacks'],
      successContracts: [
        { chainId: 8453, contractAddress: '0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8' },
        { chainId: 8453, contractAddress: '0xd2f9c0ef092d7ffd1a5de43b6ee546065461887d' },
        { chainId: 8453, contractAddress: '0x999f084f06ee49a3deef0c9d1511d2f040da4034' },
      ],
      failureContracts: [
        { chainId: 8453, contractAddress: '0x965ef172b303b0bcdc38669df1de3c26bad2db8a' },
        { chainId: 8453, contractAddress: 'derp' },
      ],
    },
    {
      '8453': '0x1081832',
    },
  );
  const testCases = [
    {
      name: 'ERC1155TL',
      input: {
        url: 'https://www.transient.xyz/stacks/kansas-smile',
        resources,
      },
      chainId: 8453,
      expected: {
        name: 'Kansas Smile',
        description:
          "'Kansas Smile' explores how our longing for the past connects with modern technology. It shows how digital tools can recreate and reimagine the past, allowing us to experience nostalgia in new ways through AI.\n\nExhibited at 'Digital Dreams' Kansas City 2024, part of the Digital Collage exhibition.\n\n(Analog and digital processes with AI)",
        contractAddress: '0x32953d7ae37b05075b88c34e800ae80c1cb1b794',
        contractMethod: 'purchase',
        contractParams: '["0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8", 1, address, 1, 0, []]',
        priceWei: '20900000000000000',
        featuredImageUrlPattern: /https:\/\/ipfs.io\/ipfs\/.+\/media/,
        availableForPurchaseStart: 1717777800000,
        availableForPurchaseEnd: 3294577800000,
        outputContractAddress: '0x7c3a99d4a7adddc04ad05d7ca87f4949c1a62fa8',
      },
    },
    {
      name: 'ERC7160TL',
      input: {
        url: 'https://www.transient.xyz/stacks/16384',
        resources,
      },
      chainId: 8453,
      expected: {
        name: '16384 Squares',
        description:
          'By exposing a 1px 8x8 grid to simulated physics turbulence, the grid interferes with the diodes in a ever changing moiré patterns, revealing a subtle breeze of random generated palm leaves behind the grid. \n\nThe colors of the leaves are then transferred back into the squares of the grid as large pixels.\n\n16384 are the amount of emitting diodes on the 128px LED artworks from Spøgelsesmaskinen. \n\nEach token holds both a 4K MP4 version and the original 128x128px GIF artwork for low res LED screens.\nOn mint a new generative variation of the art piece will be added by the artist to the token, also as both MP4 and GIF.\n\nEach piece is 60 seconds loop, of 2161 frames\n\nCollectors are able to require a physical custom assembled LED display made specifically for this artwork on https://spogel.xyz/led',
        contractAddress: '0x384092784cfaa91efaa77870c04d958e20840242',
        contractMethod: 'purchase',
        contractParams: '["0xd2f9c0ef092d7ffd1a5de43b6ee546065461887d", address, 1, 0, []]',
        priceWei: '50900000000000000',
        featuredImageUrlPattern: /^https:\/\/dv0xp0uwyoh8r\.cloudfront\.net\/stacks\/[0-9a-fA-F\-]+\/media/,
        availableForPurchaseStart: 1720465200000,
        availableForPurchaseEnd: 3297265200000,
        outputContractAddress: '0xd2f9c0ef092d7ffd1a5de43b6ee546065461887d',
      },
    },
    {
      name: 'ERC721TL',
      input: {
        url: 'https://www.transient.xyz/stacks/volumina-8',
        resources,
      },
      chainId: 8453,
      expected: {
        name: 'Volumina 8',
        description:
          'Volumina 8 is one of a series of manipulated image sequences derived from photography of Australian landscapes taken in Spring 2022. Various phone and laptop apps have been utilised to construct mosaics, kaleidoscopic patterns and other structures from the original photos, in an exploration of expanding and contracting symmetries implied and derived from organic forms and processes of the natural world.',
        contractAddress: '0x384092784cfaa91efaa77870c04d958e20840242',
        contractMethod: 'purchase',
        contractParams: '["0x999f084f06ee49a3deef0c9d1511d2f040da4034", address, 1, 0, []]',
        priceWei: '150900000000000000',
        featuredImageUrlPattern: /^https:\/\/dv0xp0uwyoh8r\.cloudfront\.net\/stacks\/[0-9a-fA-F\-]+\/media/,
        availableForPurchaseStart: 1720600200000,
        availableForPurchaseEnd: 3297400200000,
        outputContractAddress: '0x999f084f06ee49a3deef0c9d1511d2f040da4034',
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
