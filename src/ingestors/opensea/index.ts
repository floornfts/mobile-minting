import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { getOpenSeaMintPriceInEth, getProhibitionContractMetadata } from './onchain-metadata';
import { getOpenSeaMintByContract, getOpenSeaCollectionBySlug, getMintCreatorByAddress } from './offchain-metadata';
import { OPENSEA_ABI } from './abi';
import { SocialMediaPlatform } from './types';

const CONTRACT_ADDRESS = '0x00005EA00Ac477B1030CE78506496e8C2dE24bf5';

export class OpenSeaIngestor implements MintIngestor {
  async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
    return new URL(url).hostname === 'www.opensea.io' || new URL(url).hostname === 'opensea.io';
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (contractOptions.chainId !== 8453) {
      return false;
    }
    const contract = await getOpenSeaMintByContract(resources, contractOptions);
    if (!contract) {
      return false;
    }
    return true;
  }

  async createMintForContract(
    resources: MintIngestorResources,
    contractOptions: MintContractOptions,
  ): Promise<MintTemplate> {
    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('opensea');

    if (contractOptions.url) {
      mintBuilder.setMarketingUrl(contractOptions.url);
    }

    const contract = await getOpenSeaMintByContract(resources, contractOptions);

    if (!contract) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
    }

    const collection = await getOpenSeaCollectionBySlug(resources, contract.collection);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    // Find required fee recipient
    const feeRecipient = collection.fees.find((recipient) => recipient.required)?.recipient;

    const contractAddress = contract.address;

    const description = collection?.description;
    const image = collection?.image_url;

    mintBuilder.setName(collection.name).setDescription(description).setFeaturedImageUrl(image);
    mintBuilder.setMintOutputContract({ chainId: 8453, address: contract.address });
    mintBuilder.addImage(collection.banner_image_url, 'banner');

    const creator = await getMintCreatorByAddress(resources, collection.owner);

    if (!creator) {
      throw new Error("Error finding creator");
    }

    mintBuilder.setCreator({
      name: creator.username,
      walletAddress: creator.address,
      websiteUrl: creator.website,
      description: creator.bio,
      twitterUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'x' || sm.platform === 'twitter')?.username,
      floorUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'floor')?.username,
      instagramUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'instagram')?.username,
      discordUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'discord')?.username,
      tikTokUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'tiktok')?.username,
      githubUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'github')?.username,
      farcasterUsername: creator.social_media_accounts.find((sm: SocialMediaPlatform) => sm.platform === 'farcaster')?.username,
    });

    const totalPriceWei = await getOpenSeaMintPriceInEth(8453, CONTRACT_ADDRESS, contractAddress, resources.alchemy);

    const metadata = await getProhibitionContractMetadata(8453, CONTRACT_ADDRESS, contractAddress, resources.alchemy);

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress: CONTRACT_ADDRESS,
      contractMethod: 'mintPublic',
      // The payer is always the mint recipient
      contractParams: `["${contract.address}", "${feeRecipient}", "0x0000000000000000000000000000000000000000", address]`,
      abi: OPENSEA_ABI,
      priceWei: totalPriceWei,
    });

    const liveDate = new Date() > metadata.startTime ? new Date() : new Date(metadata.startTime);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(metadata.startTime*1000 || Date.now()))
      .setAvailableForPurchaseEnd(new Date(metadata.endTime*1000 || '2030-01-01'))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    // Example URL: https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview
    // First get the slug from the end
    const splits = url.split('/');
    splits.pop();
    const slug = splits.pop();

    const collection = await getOpenSeaCollectionBySlug(resources, slug);
    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
    }

    // Make sure one has the exact slug we're looking for and is on BASE or ETHEREUM (not TEZOS)
    // const contract = collection.contracts.find((c: Contract) => c.chain === 'base');
    const contract = collection.contracts[0];

    if (!contract) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Contract not found');
    }

    const dropAddress = contract.address;
    const chainId = contract.chain === 'base' ? 8453 : null;

    if (!chainId) {
      throw new MintIngestorError(MintIngestionErrorName.MintUnsupportedNetwork, 'Chain not supported');
    }

    return this.createMintForContract(resources, { chainId, contractAddress: dropAddress, url });
  }
}
