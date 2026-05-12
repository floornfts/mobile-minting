import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import {
  findScatterMintOption,
  getScatterCollectionBySlug,
  resolveScatterCollectionForContract,
  scatterSlugFromUrl,
  scatterUrlForSlug,
  SCATTER_ZERO_ADDRESS,
} from './offchain-metadata';
import { SCATTER_MINT_ABI } from './abi';
import { ScatterCollection } from './types';

export class ScatterIngestor implements MintIngestor {
  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    const slug = scatterSlugFromUrl(url);
    if (!slug) {
      return false;
    }

    const collection = await getScatterCollectionBySlug(resources, slug);
    if (!collection || collection.chain_id !== 8453) {
      return false;
    }

    return !!(await findScatterMintOption(resources, collection));
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    const collection = await resolveScatterCollectionForContract(resources, contractOptions);
    if (!collection) {
      return false;
    }

    return !!(await findScatterMintOption(resources, collection));
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const slug = scatterSlugFromUrl(url);
    if (!slug) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const collection = await getScatterCollectionBySlug(resources, slug);
    if (!collection || collection.chain_id !== 8453) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    return this.createMintTemplate(resources, collection, url);
  }

  async createMintForContract(
    resources: MintIngestorResources,
    contractOptions: MintContractOptions,
  ): Promise<MintTemplate> {
    const collection = await resolveScatterCollectionForContract(resources, contractOptions);
    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    return this.createMintTemplate(
      resources,
      collection,
      contractOptions.url || scatterUrlForSlug(collection.slug || ''),
    );
  }

  private async createMintTemplate(
    resources: MintIngestorResources,
    collection: ScatterCollection,
    marketingUrl: string,
  ): Promise<MintTemplate> {
    const mintOption = await findScatterMintOption(resources, collection);
    if (!mintOption) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not available');
    }

    const { inviteList, mintResponse } = mintOption;
    const image = collection.avatar_uri || collection.hero_uri || collection.banner_uri;
    if (!image) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Image not available');
    }

    const startDate = inviteList.start_time ? new Date(inviteList.start_time) : new Date();
    const endDate = inviteList.end_time ? new Date(inviteList.end_time) : new Date('2030-01-01T00:00:00Z');
    const liveDate = new Date() > startDate ? new Date() : startDate;

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Scatter')
      .setMarketingUrl(marketingUrl)
      .setName(collection.name)
      .setDescription(collection.description || '')
      .setFeaturedImageUrl(image)
      .setMintOutputContract({ chainId: 8453, address: collection.address })
      .setCreator({
        name: collection.name,
        walletAddress: collection.creator_address,
        websiteUrl: collection.website || (collection.slug ? scatterUrlForSlug(collection.slug) : undefined),
        twitterUsername: usernameFromXUrl(collection.twitter),
      })
      .setMintInstructions({
        chainId: 8453,
        contractAddress: collection.address,
        contractMethod: 'mint',
        contractParams: `[["${inviteList.root}", []], quantity, "${SCATTER_ZERO_ADDRESS}", "0x"]`,
        abi: SCATTER_MINT_ABI,
        priceWei: mintResponse.mintTransaction?.value || '0',
        supportsQuantity: true,
      })
      .setAvailableForPurchaseStart(startDate)
      .setAvailableForPurchaseEnd(endDate)
      .setLiveDate(liveDate);

    if (collection.hero_uri && collection.hero_uri !== image) {
      mintBuilder.addImage(collection.hero_uri, 'hero');
    }
    if (collection.banner_uri && collection.banner_uri !== image) {
      mintBuilder.addImage(collection.banner_uri, 'banner');
    }

    return mintBuilder.build();
  }
}

const usernameFromXUrl = (url: string | null | undefined): string | undefined => {
  if (!url) {
    return;
  }
  try {
    return new URL(url).pathname.split('/').filter(Boolean)[0];
  } catch (error) {
    return;
  }
};
