import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { getHighlightMetadata, getHighlightMintPriceInWei } from './onchain-metadata';
import {
  getHighlightCollectionByAddress,
  getHighlightCollectionById,
  getHighlightCollectionOwnerDetails,
  getHighlightVectorId,
} from './offchain-metadata';
import { MINT_CONTRACT_ABI } from './abi';

const CONTRACT_ADDRESS = '0x8087039152c472Fa74F47398628fF002994056EA';

export class HighlightIngestor implements MintIngestor {
  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    const id = url.split('/').pop();
    if (!id) {
      return false;
    }

    const collection = await getHighlightCollectionById(resources, id);

    if (!collection || collection.chainId !== 8453) {
      return false;
    }

    const urlPattern = /^https:\/\/highlight\.xyz\/mint\/[a-f0-9]{24}$/;
    return (
      new URL(url).hostname === 'www.highlight.xyz' || new URL(url).hostname === 'highlight.xyz' || urlPattern.test(url)
    );
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (contractOptions.chainId !== 8453) {
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
    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Highlight');

    if (contractOptions.url) {
      mintBuilder.setMarketingUrl(contractOptions.url);
    }

    const collection = await getHighlightCollectionByAddress(resources, contractOptions);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    const contractAddress = collection.contract;
    const description = collection?.description;

    mintBuilder
      .setName(collection.name)
      .setDescription(description)
      .setFeaturedImageUrl(collection.image.split('?')[0]);
    mintBuilder.setMintOutputContract({ chainId: 8453, address: contractAddress });

    if (collection.sampleImages.length) {
      collection.sampleImages.forEach((url, index) => {
        mintBuilder.addImage(url, `Sample image #${index}`);
      });
    }

    if (!collection.creator) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Error finding creator');
    }

    const creator = await getHighlightCollectionOwnerDetails(resources, collection.highlightCollection.id);

    mintBuilder.setCreator({
      name: creator.creatorAccountSettings.displayName,
      walletAddress: collection.creator,
      imageUrl: creator.creatorAccountSettings.displayAvatar,
    });

    const vectorId = await getHighlightVectorId(resources, collection.highlightCollection.id);

    if (!vectorId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Id not available');
    }

    const totalPriceWei = await getHighlightMintPriceInWei(+vectorId, resources.alchemy);

    if (!totalPriceWei) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Price not available');
    }

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress: CONTRACT_ADDRESS,
      contractMethod: 'vectorMint721',
      contractParams: `[${vectorId}, 1, address]`,
      abi: MINT_CONTRACT_ABI,
      priceWei: totalPriceWei,
    });

    const metadata = await getHighlightMetadata(+vectorId, resources.alchemy);

    if (!metadata) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing timestamps');
    }

    const { startTimestamp, endTimestamp } = metadata;

    const liveDate = +new Date() > startTimestamp * 1000 ? new Date() : new Date(startTimestamp * 1000);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(startTimestamp * 1000 || Date.now()))
      .setAvailableForPurchaseEnd(new Date(endTimestamp * 1000 || '2030-01-01'))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    // Example URL: https://highlight.xyz/mint/665fa33f07b3436991e55632
    const splits = url.split('/');
    const id = splits.pop();
    const chain = splits.pop();

    if (!id) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Url error');
    }

    const collection = await getHighlightCollectionById(resources, id);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'No such collection');
    }

    return this.createMintForContract(resources, {
      chainId: collection.chainId,
      contractAddress: collection.address,
      url,
    });
  }
}
