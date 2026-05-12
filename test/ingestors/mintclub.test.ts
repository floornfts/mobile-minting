import { EVMMintInstructions } from '../../src/lib/types/mint-template';
import { MintTemplateBuilder } from '../../src/lib/builder/mint-template-builder';
import { MintClubIngestor } from '../../src/ingestors/mintclub';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { basicIngestorTests } from '../shared/basic-ingestor-tests';
import { expect } from 'chai';
import {
  computeMintClubBase1155Address,
  getMintClubEligibilityDetails,
  getMintClubTokenDetails,
  mintClubUrlForSymbol,
} from '../../src/ingestors/mintclub/offchain-metadata';
import { mintIngestorResources } from '../../src/lib/resources';

const resources = mintIngestorResources();
if (process.env.ALCHEMY_API_KEY === 'dummy') {
  const provider = new StaticJsonRpcProvider('https://mainnet.base.org', {
    chainId: 8453,
    name: 'base',
  });
  resources.alchemy.config.getProvider = async () => provider as any;
}

const eligibleMintClubBaseMints = [
  {
    symbol: 'PUNKS',
    token: '0x9974A5CD8C484D7df85a0C56B807E98755cD732B',
    supply: 100000,
    holders: 381,
    holdersUrl: 'https://basescan.org/token/0x9974A5CD8C484D7df85a0C56B807E98755cD732B#balances',
  },
  {
    symbol: 'APD',
    token: '0x3FBd3D7d9e465811db58f745eA7fA42901Aa31db',
    supply: 70000,
    holders: 408,
    holdersUrl: 'https://basescan.org/token/0x3FBd3D7d9e465811db58f745eA7fA42901Aa31db#balances',
  },
  {
    symbol: 'CULT',
    token: '0x0bBAa6f85ad8199302f16507ACc911aCd49E7863',
    supply: 10000,
    holders: 420,
    holdersUrl: 'https://basescan.org/token/0x0bBAa6f85ad8199302f16507ACc911aCd49E7863#balances',
  },
  {
    symbol: 'BLOB',
    token: '0x832C76B6Ec18e37A2b5B4718a843D4633efFAaB0',
    supply: 10000,
    holders: 171,
    holdersUrl: 'https://basescan.org/token/0x832C76B6Ec18e37A2b5B4718a843D4633efFAaB0#balances',
  },
  {
    symbol: 'OBSIDIAN',
    token: '0x3519cDa3A69Aba975065a888CD206040F5288A0b',
    supply: 10000,
    holders: 917,
    holdersUrl: 'https://basescan.org/token/0x3519cDa3A69Aba975065a888CD206040F5288A0b#balances',
  },
  {
    symbol: 'EKT',
    token: '0xf3ce291d8AdE6c2bf3a4431F10D1616f2BD307fa',
    supply: 9995,
    holders: 438,
    holdersUrl: 'https://basescan.org/token/0xf3ce291d8AdE6c2bf3a4431F10D1616f2BD307fa#balances',
  },
  {
    symbol: 'TRUMPEP',
    token: '0x102426Ce29AeF9C2952aa16507A6AcAf51216C69',
    supply: 8888,
    holders: 339,
    holdersUrl: 'https://basescan.org/token/0x102426Ce29AeF9C2952aa16507A6AcAf51216C69#balances',
  },
  {
    symbol: 'EARTH',
    token: '0x7f1d47133680c89138e7c04b6411b5f4Bca7eE96',
    supply: 8888,
    holders: 301,
    holdersUrl: 'https://basescan.org/token/0x7f1d47133680c89138e7c04b6411b5f4Bca7eE96#balances',
  },
  {
    symbol: 'EARLY',
    token: '0x9B98A355840f01D4a6a0E97c3dF430e37A2695Dc',
    supply: 5556,
    holders: 482,
    holdersUrl: 'https://basescan.org/token/0x9B98A355840f01D4a6a0E97c3dF430e37A2695Dc#balances',
  },
  {
    symbol: 'PEAKYPEPE',
    token: '0x69832024e4cfcfda7BA0dc8f646e4548E24E95A7',
    supply: 5555,
    holders: 272,
    holdersUrl: 'https://basescan.org/token/0x69832024e4cfcfda7BA0dc8f646e4548E24E95A7#balances',
  },
];

describe('MintClub', function () {
  this.timeout(90000);

  basicIngestorTests(
    new MintClubIngestor(),
    resources,
    {
      successUrls: ['https://mint.club/nft/base/PUNKS'],
      failureUrls: [
        'https://mint.club',
        'https://mint.club/nft/ethereum/PUNKS',
        'https://example.com/nft/base/PUNKS',
        'https://mint.club/nft/base/MINIBD',
      ],
      successContracts: [
        {
          chainId: 8453,
          contractAddress: '0x9974A5CD8C484D7df85a0C56B807E98755cD732B',
          url: 'https://mint.club/nft/base/PUNKS',
        },
      ],
      failureContracts: [
        { chainId: 1, contractAddress: '0x9974A5CD8C484D7df85a0C56B807E98755cD732B' },
        { chainId: 8453, contractAddress: '0x475f8E3eE5457f7B4AAca7E989D35418657AdF2a' },
      ],
    },
    {
      8453: '0x1c1c6c0',
    },
  );

  it('documents Mint Club eligibility with 10 prior WETH-backed Base ERC1155 mints over 100 holders', async function () {
    const evidence = [];
    for (const mint of eligibleMintClubBaseMints) {
      const details = await getMintClubEligibilityDetails(resources, mint.token);
      evidence.push({
        symbol: mint.symbol,
        token: details?.token,
        computedToken: computeMintClubBase1155Address(mint.symbol),
        reserveToken: details?.reserveToken,
        currentSupply: Number(details?.currentSupply || 0n),
        maxSupply: Number(details?.maxSupply || 0n),
        holders: mint.holders,
        holdersUrl: mint.holdersUrl,
      });
    }

    const uniqueCollectorLowerBound = Math.max(...evidence.map((mint) => mint.holders));
    const failures = evidence.filter((mint, index) => {
      const expected = eligibleMintClubBaseMints[index];
      return (
        mint.token !== expected.token ||
        mint.computedToken !== expected.token ||
        mint.currentSupply < expected.supply ||
        mint.currentSupply >= mint.maxSupply ||
        mint.holders <= 100 ||
        mint.holdersUrl !== `https://basescan.org/token/${expected.token}#balances`
      );
    });

    expect(evidence.length).to.equal(10);
    expect(uniqueCollectorLowerBound).to.be.greaterThan(100);
    expect(failures).to.deep.equal([]);
  });

  it('createMintTemplateForUrl: returns Mint Club mint instructions for a WETH-backed Base ERC1155', async function () {
    const ingestor = new MintClubIngestor();
    const template = await ingestor.createMintTemplateForUrl(resources, mintClubUrlForSymbol('PUNKS'));
    const builder = new MintTemplateBuilder(template);
    builder.validateMintTemplate();

    expect(template.name).to.equal('PUNK MOSH PIT');
    expect(template.description).to.equal(
      'PUNK MOSH PIT (PUNKS) is a Bonding Curved ERC-1155 token on Base Network.',
    );
    expect(template.featuredImageUrl).to.equal(
      'https://mint-club-v2.s3.us-west-2.amazonaws.com/8453/0x9974A5CD8C484D7df85a0C56B807E98755cD732B/logo.webp?t=1712304893557',
    );
    expect(template.marketingUrl).to.equal('https://mint.club/nft/base/PUNKS');
    expect(template.creator?.walletAddress).to.equal('0xb3d1DDa9A7d5539DbE4c37058c2083d6725A5B28');
    expect(template.mintOutputContract?.address).to.equal('0x9974A5CD8C484D7df85a0C56B807E98755cD732B');

    const mintInstructions = template.mintInstructions as EVMMintInstructions;
    expect(mintInstructions.chainId).to.equal(8453);
    expect(mintInstructions.contractAddress).to.equal('0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa');
    expect(mintInstructions.contractMethod).to.equal('mintWithEth');
    expect(mintInstructions.contractParams).to.equal(
      '["0x9974A5CD8C484D7df85a0C56B807E98755cD732B", 1, address]',
    );
    expect(BigInt(mintInstructions.priceWei) > 0n).to.be.true;
    expect(mintInstructions.supportsQuantity).to.be.false;
  });
});
