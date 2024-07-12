import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { fxHashContractForPricingType, getFxhashMintByContract, getFxHashMintsBySlug, getPricingFromParams } from './offchain-metadata';
import { FX_HASH_MINTABLE_ABI } from './abi';

export class FxHashIngestor implements MintIngestor {
  async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
    return new URL(url).hostname === 'www.fxhash.xyz' || new URL(url).hostname === 'fxhash.xyz';
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    if (contract.chainId !== 8453) {
      return false;
    }
    const token = await getFxhashMintByContract(resources, contract)
    if (!token) {
      return false;
    }
    return true;
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {
    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('fxhash');

    if (contract.url) {
      mintBuilder.setMarketingUrl(contract.url);
    }

    const token = await getFxhashMintByContract(resources, contract);

    if (!token) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
    }

    const { priceWei, type } = getPricingFromParams(token, false);

    if (!type) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Could not resolve mint type');
    }

    const contractAddress = fxHashContractForPricingType(type, token.chain);

    const abi = FX_HASH_MINTABLE_ABI;

    const description = token.metadata?.description || '';
    const image = token.metadata?.thumbnailUri || '';

    mintBuilder.setName(token.name).setDescription(description).setFeaturedImageUrl(image);
    mintBuilder.setMintOutputContract({ chainId: contract.chainId, address: contract.contractAddress });
    mintBuilder.setCreator({
      name: token.author.account.username,
      imageUrl: token.author.account.profile.picture,
      walletAddress: token.author.account.wallets?.find((w: any) => w.address.startsWith('0x'))?.address,
      websiteUrl: token.author.account.profile.website,
      description: token.author.account.profile.description,
      twitterUsername: token.author.account.profile.twitter?.split('/').pop(),
    })

    mintBuilder.setMintInstructions({
      chainId: contract.chainId,
      contractAddress,
      contractMethod: 'buy',
      contractParams: `["${contract.contractAddress}", 1, 1, address]`,
      abi: abi,
      priceWei: `${priceWei}`,
    });

    const liveDate = new Date() > token.mintOpensAt ? new Date() : new Date(token.mintOpensAt);
    mintBuilder
      .setAvailableForPurchaseEnd(new Date(token.openEditionsEndsAt || '2030-01-01'))
      .setAvailableForPurchaseStart(new Date(token.mintOpensAt || Date.now()))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    // Example URL: https://www.fxhash.xyz/generative/slug/allegro
    // First get the slug from the end
    const slug = url.split('/').pop();

    const tokens = await getFxHashMintsBySlug(resources, slug);
    // Make sure one has the exact slug we're looking for and is on BASE or ETHEREUM (not TEZOS)
    const token = tokens.find(
      (t: any) => t.slug === slug && t.chain !== 'TEZOS',
    );

    if (!token) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
    }

    // For newer / eth based collections, the id is the contract
    const dropAddress = token.id;
    const chainId = token.chain === 'BASE' ? 8453 : null;

    if (!chainId) {
      throw new MintIngestorError(MintIngestionErrorName.MintUnsupportedNetwork, 'Chain not supported');
    }

    return this.createMintForContract(resources, { chainId, contractAddress: dropAddress, url });
  }
}
