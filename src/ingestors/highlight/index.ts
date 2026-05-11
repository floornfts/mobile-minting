import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import {
  getHighlightCollectionByAddress,
  getHighlightCollectionById,
  getHighlightCollectionIdByOnChainId,
  getHighlightMintContractAddress,
  getHighlightMintDataForCollection,
  getHighlightMintVectorId,
  getHighlightVectorPriceInWei,
  isSupportedHighlightChain,
  normalizeHighlightOnChainCollectionId,
} from './offchain-metadata';
import { MINT_CONTRACT_ABI } from './abi';
import { CollectionByAddress } from './types';

const HIGHLIGHT_HOSTS = new Set(['highlight.xyz', 'www.highlight.xyz']);
const DEFAULT_END_TIMESTAMP_SECONDS = 1893456000;

const getHighlightMintIdFromUrl = (url: string): string | undefined => {
  try {
    const parsedUrl = new URL(url);
    if (!HIGHLIGHT_HOSTS.has(parsedUrl.hostname)) {
      return undefined;
    }

    const [, mintPath, id] = parsedUrl.pathname.split('/');
    if (mintPath !== 'mint' || !id) {
      return undefined;
    }

    return decodeURIComponent(id);
  } catch (error) {}
};

const getTimestampSeconds = (value: string, fieldName: string): number => {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, `${fieldName} not available`);
  }
  return Math.floor(timestamp / 1000);
};

export class HighlightIngestor implements MintIngestor {
  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    const collection = await this.getCollectionFromUrl(resources, url);
    if (!collection) {
      return false;
    }

    return !!getHighlightMintDataForCollection(collection);
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (!isSupportedHighlightChain(contractOptions.chainId)) {
      return false;
    }
    const collection = await getHighlightCollectionByAddress(resources, contractOptions);
    if (!collection) {
      return false;
    }
    return true;
  }

  async createMintForContract(
    resources: MintIngestorResources,
    contractOptions: MintContractOptions,
  ): Promise<MintTemplate> {
    const collection = await getHighlightCollectionByAddress(resources, contractOptions);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    return this.buildMintTemplate(collection, contractOptions.url);
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const collection = await this.getCollectionFromUrl(resources, url);
    const mintData = collection ? getHighlightMintDataForCollection(collection) : undefined;

    if (!mintData) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    return this.buildMintTemplate(mintData, url);
  }

  private async getCollectionFromUrl(resources: MintIngestorResources, url: string) {
    const id = getHighlightMintIdFromUrl(url);
    if (!id) {
      return undefined;
    }

    if (/^[a-f0-9]{24}$/i.test(id)) {
      return getHighlightCollectionById(resources, id);
    }

    const onChainId = normalizeHighlightOnChainCollectionId(id);
    if (!onChainId) {
      return undefined;
    }

    const collectionId = await getHighlightCollectionIdByOnChainId(resources, onChainId);
    if (!collectionId) {
      return undefined;
    }

    return getHighlightCollectionById(resources, collectionId);
  }

  private buildMintTemplate(collection: CollectionByAddress, url: string | undefined): MintTemplate {
    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Highlight');

    if (url) {
      mintBuilder.setMarketingUrl(url);
    }

    const description = collection?.description;

    mintBuilder.setName(collection.name).setDescription(description).setFeaturedImageUrl(collection.image.split('?')[0]);

    if (collection.sampleImages.length) {
      collection.sampleImages.forEach((url, index) => {
        mintBuilder.addImage(url, `Sample image #${index}`);
      });
    }

    if (!collection.creator) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Error finding creator');
    }

    const collectionId = collection.id;

    if (!collectionId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Collection id not available');
    }
    mintBuilder.setCreator({
      name: collection.creatorAccountSettings?.displayName || '',
      walletAddress: collection.creator,
      imageUrl: collection.creatorAccountSettings?.displayAvatar,
    });

    mintBuilder.setMintOutputContract({ chainId: collection.chainId, address: collection.primaryContract });

    const vectorId = getHighlightMintVectorId(collection.mintVector);

    if (!vectorId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Id not available');
    }

    const totalPriceWei = getHighlightVectorPriceInWei(collection.mintVector);

    if (!totalPriceWei) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Price not available');
    }

    const mintContractAddress = getHighlightMintContractAddress(collection.mintVector);

    if (!mintContractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Mint contract not available');
    }

    mintBuilder.setMintInstructions({
      chainId: collection.chainId,
      contractAddress: mintContractAddress,
      contractMethod: 'vectorMint721',
      contractParams: `[${vectorId}, quantity, address]`,
      abi: MINT_CONTRACT_ABI,
      priceWei: totalPriceWei,
      supportsQuantity: true,
    });

    const { mintVector } = collection;
    const startTimestamp = getTimestampSeconds(mintVector.start, 'Start date');
    const endTimestamp = mintVector.end
      ? getTimestampSeconds(mintVector.end, 'End date')
      : DEFAULT_END_TIMESTAMP_SECONDS;

    const liveDate = +new Date() > startTimestamp * 1000 ? new Date() : new Date(startTimestamp * 1000);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(startTimestamp * 1000))
      .setAvailableForPurchaseEnd(new Date(endTimestamp * 1000))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }
}
