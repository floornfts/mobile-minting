## What is Mobile Minting?
Mobile Minting unlocks mobile payments for onchain purchases and powers minting in the Floor app.

**📱 Users pay in-app with In-App Purchases**

**⛓️ A fleet of signers instantly deliver NFTs onchain**

For users: no 🌉 Bridging, no ⛽️ Gas fees - just the tap of a button!

<img width="1251" alt="mm" src="https://github.com/floornfts/mobile-minting/assets/1068437/5ea33905-d645-48e5-84c0-f56c1ab28b3a">

_Example Mobile Minting user experience._

<br />

## What is this repository?
This repository is a **public, contributable collection of Ingestors** that teach Mobile Minting how to support mints from new platforms. 

Historically, only Floor could choose what mints users could mint through Floor based on our roadmap, or partnerships, now anyone can build support for any minting platform / product and (provided it meets some safety & reliability checks) it can be included in Mobile Minting.

This library is included in Floor's platform and executed in a sandboxed environment for indexing mints.

<br />
## Adding a new platform to Mobile Minting

Adding a new platform to Mobile Minting is easy - you just have to write a `MintIngestor`!

### MintIngestor functionality
A MintIngestor has one simple job:

> Transform a URL into a valid MintTemplate, iff that URL represents a supported mint by the ingestor

![template](https://github.com/floornfts/mobile-minting/assets/1068437/7693bfe2-8754-48ba-ac5d-7b222b1435de)


<br />

### What is a `MintTemplate`?
A MintTemplate is a standard format for expressing the details of a mint. It's used to populate the marketing page, pricing, and ultimately fulfill the item onchain.

<img width="1341" alt="mint-template" src="https://github.com/floornfts/mobile-minting/assets/1068437/9bdd3a1f-14a4-4506-9d77-2981f825fc9f">

_Mapping of MintTemplate fields to an in-app mint._

Once you generate a MintTemplate, Floor will do all the additional work to get the mint live:

* Map priceWei to an in-app purchase
* Simulate the transaction in multiple scenarios to ensure success
* Re-host all images & cache IPFS resources

The full process looks something like this...

![mint-template-flow](https://github.com/floornfts/mobile-minting/assets/1068437/fbe12e74-da4a-40ab-822b-aea197b35d3f)


<br />

### Writing your first `MintIngestor`
We recommend consulting example complete ingestor PRs e.g. [#1: Prohibition Daily](https://github.com/floornfts/mobile-minting/pull/1/files).

You will create a new folder in `src/ingestors` for your new Ingestor.

```ts
export class MyMintIngestor implements MintIngestor {
  async supportsUrl(url: string): Promise<boolean> {
    // check if URL is supported by your ingestor
  }

  async createMintTemplateForUrl(url: string, resources: MintIngestorResources): Promise<MintTemplate> {
    // create the mint template for your URL
  }
}
```

For building the MintTemplate, we recommend using the `MintTemplateBuilder` which will ensure validation and give handy builder methods.

In this example we make a template, relying on `getMintMetadataFromSomewhere()` and `getMintContractDetailsFromSomewhere()` to fetch the marketing & onchain data respectively. We'll touch on those later.


```ts
  const mintBuilder = new MintTemplateBuilder()
      .setOriginalUrl(url)
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('MyMints');

  const { name, description, image } = await getMintMetadataFromSomewhere();
  mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(image);

  const { contractAddress, priceWei } = await getMintContractDetailsFromSomewhere();
  mintBuilder.setMintInstructions({
      chainId: '8453',
      contractAddress,
      contractMethod: 'mint',
      contractParams: '[address, 1]',
      abi: YOUR_ABI_FILE_IMPORT,
      priceWei: totalPriceWei,
    });
```

You can then build the MintTemplate from the builder.

```ts
  return mintBuilder.build();
```

Note that `mintBuilder.build()` will throw if the MintTemplate does not meet validation requirements.

<br />

### Getting outside resources
Your MintIngestor is passed a `resources` object in it's sandboxed environment.

```ts
async createMintTemplateForUrl(url: string, resources: MintIngestorResources): Promise<MintTemplate>
```

This resources object contains properties:
* `alchemy`: An initalized Alchemy instance
* `fetch`: An HTTP client (Axios)

You can use these to fetch resources you need.

**Note: You will need to set up a locally Alchemy key for testing, and YOU MUST NOT attempt to import resources not passed in the resources object**

<br />

### Local Setup
In order to use the Alchemy instance on resources, you will need to set a local Alchemy key.

* Copy `.env.sample` -> `.env`
* Insert your own Alchemy API key as `ALCHEMY_API_KEY`

This repo uses [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) to manage dependencies & execution.

When you pull the repository, setup can be completed (and confirmed) using:

```bash
yarn
yarn test
```

<br />

# Submitting a Mobile Minting Ingestor
Once you've written a Mobile Minting Ingestor, it needs to be Pull Requested to this repository to be included in the production Floor Mobile Minting ingestion fleet.

### Before you submit
- [ ] Ensure your generated MintTemplate works 😄
- [ ] Ensure that your code is restricted to a single folder in `src/ingestors`
- [ ] Ensure that all required assets are included (e.g. ABIs)
- [ ] Ensure that a test exists for generating a MintTemplate that will always succeed
- [ ] Ensure that your code accesses **no external resources** except those passed in the `resources` object

### Submitting a Mint Ingestor

Open a Pull Request against this repo with your new Ingestor, as well as any comments / questions. 

We're excited to see new platforms supported, so will quickly jump to help!

### Hopes and dreams
Mobile Minting started out entirely internal & this is our first experiment in decentralizing it & making it more accessible.

In time, we hope to continue down this path, but for now all ingestors will be reviewed by the Floor engineering team & accepted on the basis of safety, cost & other considerations by Floor.

We hope to see people (other companies!?) emerge for whom Mobile Minting, and a unified standard for expressing onchain mints is useful, and look forward to working with them to continue this mission.

### Questions?
Open an issue, or email developers@floor.fun


