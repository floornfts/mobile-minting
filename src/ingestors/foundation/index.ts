import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { getFoundationMintPriceInWei } from './onchain-metadata';
import { getFoundationMintByAddress } from './offchain-metadata';
import { FOUNDATION_MINT_ABI } from './abi';

const CONTRACT_ADDRESS = '0x62037b26ffF91929655AA3A060F327b47d1e2b3e';

const getChainId = (chain: string) => {
  switch (chain) {
    case 'base':
      return 8453;

    default:
      return 1;
  }
};

export class FoundationIngestor implements MintIngestor {
  async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
    return new URL(url).hostname === 'www.foundation.app' || new URL(url).hostname === 'foundation.app';
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (contractOptions.chainId !== 8453) {
      return false;
    }
    const contract = await getFoundationMintByAddress(resources, contractOptions);
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
      .setPartnerName('foundation');

    if (contractOptions.url) {
      mintBuilder.setMarketingUrl(contractOptions.url);
    }

    const collection = await getFoundationMintByAddress(resources, contractOptions);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    // Find required fee recipient
    const contractAddress = collection.contractAddress;

    const description = collection?.description;
    const image = collection?.media.url;

    mintBuilder.setName(collection.name).setDescription(description).setFeaturedImageUrl(image);
    mintBuilder.setMintOutputContract({ chainId: 8453, address: contractAddress });
    mintBuilder.addImage(collection.banner_image_url, 'banner');

    if (!collection.creator) {
      throw new Error('Error finding creator');
    }

    mintBuilder.setCreator({
      name: collection.creator.name,
      walletAddress: collection.creator.publicKey,
    });

    const totalPriceWei = await getFoundationMintPriceInWei(
      8453,
      CONTRACT_ADDRESS,
      contractAddress,
      resources.alchemy,
      collection.saleType,
    );

    if (collection.saleType === 'FIXED_PRICE_DROP') {
    }

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress: CONTRACT_ADDRESS,
      contractMethod:
        collection.saleType === 'FIXED_PRICE_DROP'
          ? 'mintFromFixedPriceSaleWithEarlyAccessAllowlistV2'
          : 'mintFromDutchAuctionV2',
      // The payer is always the mint recipient
      contractParams:
        collection.saleType === 'FIXED_PRICE_DROP'
          ? `["${collection.contractAddress}", 1, "${contractOptions.recipient}", "0x0000000000000000000000000000000000000000", "0x00000000000000000000000000000000000000a0]`
          : `["${collection.contractAddress}", 1, "${contractOptions.recipient}"]`,
      abi: FOUNDATION_MINT_ABI,
      priceWei: totalPriceWei,
    });

    const liveDate =
      new Date() > collection.generalAvailabilityStartTime
        ? new Date()
        : new Date(collection.generalAvailabilityStartTime);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(collection.generalAvailabilityStartTime || Date.now()))
      .setAvailableForPurchaseEnd(new Date(collection.endTime || '2030-01-01'))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(
    resources: MintIngestorResources,
    url: string,
    recipient: string,
  ): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    // Example URL: https://opensea.io/collection/parallel-ocs-24-starter-bundle/overview
    // First get the slug from the end
    const splits = url.split('/');
    const tokenAddress = splits.pop();
    const chain = splits.pop();

    if (!chain || !tokenAddress) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Url error');
    }

    const chainId = getChainId(chain);
    return this.createMintForContract(resources, { chainId, contractAddress: tokenAddress, url, recipient });
  }
}
