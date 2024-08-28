import { expect } from 'chai';
import { CoinbaseWalletIngestor } from '../../src/ingestors/coinbase-wallet';
import { mintIngestorResources } from '../../src/lib/resources';
import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';

const resources = mintIngestorResources();

describe('CoinbaseWallet', function () {
  basicIngestorTests(
    new CoinbaseWalletIngestor(),
    resources,
    {
      successUrls: [
        'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0xb5408b7126142C61f509046868B1273F96191b6d',
        'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0xEE8128c612ABE57070dEac0E299282ef0a71a347',
        'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0x3aDa53708b167Fbd2907b5a1bA19b58a856E2200'
      ],
      failureUrls: [
        'https://wallet.coinbase.com/nft/gallery/ethereum-etf',
        'https://foundation.app/mint/base/the-billows',
      ],
      successContracts: [
        { chainId: 8453, contractAddress: '0x13F294BF5e26843C33d0ae739eDb8d6B178740B0' },
        { chainId: 8453, contractAddress: '0xEE8128c612ABE57070dEac0E299282ef0a71a347' },
      ],
      failureContracts: [{ chainId: 5000, contractAddress: '0x62F8C536De24ED32611f128f64F6eAbd9b82176c' }],
    },
    {
      '8453': '0x1175BA0',
    },
  );
  it('supportsUrl: Returns false for an unsupported URL', async function () {
    const ingestor = new CoinbaseWalletIngestor();
    const url = 'https://wallet.coinbase.com/nft/gallery/ethereum-etf';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.false;
  });

  it('supportsUrl: Returns true for a supported URL', async function () {
    const ingestor = new CoinbaseWalletIngestor();
    const url = 'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0xb5408b7126142C61f509046868B1273F96191b6d';
    const resources = mintIngestorResources();
    const result = await ingestor.supportsUrl(resources, url);
    expect(result).to.be.true;

    const url2 = 'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0x17ca8424F3c42aA840eB1B54a2400eC80330Eea8';
    const result2 = await ingestor.supportsUrl(resources, url2);
    expect(result2).to.be.true;
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
    const ingestor = new CoinbaseWalletIngestor();
    const url = 'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0x17ca8424F3c42aA840eB1B54a2400eC80330Eea8';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Italy Is Based');
    expect(template.description).to.contain('Join the Italian Base community and fully enjoy the Onchain Summer');
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0x17ca8424F3c42aA840eB1B54a2400eC80330Eea8');
    expect(mintInstructions.contractMethod).to.equal('mintWithComment');
    expect(mintInstructions.contractParams).to.equal('[address, 1, ""]');
    expect(mintInstructions.priceWei).to.equal('100000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://ipfs.io/ipfs/Qme3w2B1W9zHsASbV7KRgdfrkHLFCWfhtQiDgeEYbzSHnb/nft-gallery-1gif',
    );

    if (template.creator) {
      expect(template.creator.walletAddress?.toLowerCase()).to.equal('0x30bec89100f144aad632153de93b58a32772cf58');
    }

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-07-24T22:02:16.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.greaterThan(+new Date('2030-01-01T00:00:00.000Z'));
  });

  it('createMintTemplateForUrl: Returns a mint template for a supported URL with creator metadata', async function () {
    const ingestor = new CoinbaseWalletIngestor();
    const url = 'https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0xf9aDb505EaadacCF170e48eE46Ee4d5623f777d7';
    const resources = mintIngestorResources();
    const template = await ingestor.createMintTemplateForUrl(resources, url);

    // Verify that the mint template passed validation
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('Onchain Summit 2024 San Francisco');
    expect(template.description).to.contain(
      'Base community is bringing the Onchain Summit Billboard to life in San Francisco',
    );
    const mintInstructions = template.mintInstructions as EVMMintInstructions;

    expect(mintInstructions.contractAddress).to.equal('0xf9aDb505EaadacCF170e48eE46Ee4d5623f777d7');
    expect(mintInstructions.contractMethod).to.equal('mintWithComment');
    expect(mintInstructions.contractParams).to.equal('[address, 1, ""]');
    expect(mintInstructions.priceWei).to.equal('800000000000000');

    expect(template.featuredImageUrl).to.equal(
      'https://ipfs.io/ipfs/QmYuxDK8zkCF6taNTZuMSVAPbDDATZzdtVbHBSfPxCmT9J/nft-gallery-1png',
    );

    if (template.creator) {
      expect(template.creator.name).to.equal('onchainsummit.base.eth');
      expect(template.creator.walletAddress?.toLowerCase()).to.equal('0x03489e02bf56b43a8e91287e8cfef76a7a6a9aa3');
    }

    expect(template.marketingUrl).to.equal(url);
    expect(template.availableForPurchaseStart?.getTime()).to.equal(+new Date('2024-07-26T23:20:15.000Z'));
    expect(template.availableForPurchaseEnd?.getTime()).to.equal(+new Date('2024-08-31T15:20:19.000Z'));
  });
});
