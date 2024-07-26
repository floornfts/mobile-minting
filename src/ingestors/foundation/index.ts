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
    case 'eth':
    default:
      return 1;
  }
};

export class FoundationIngestor implements MintIngestor {
  async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
    const urlSplit = url.split('/');
    const slug = urlSplit.pop();
    if (!slug || slug.length !== 42 || !slug.startsWith('0x')) {
      return false;
    }
    const chain = urlSplit.pop();
    if (chain !== 'base') {
      return false;
    }
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
    if (contract.contractType !== 'FND_BATCH_MINT_REVEAL') {
      return false;
    }
    return true;
  }

  async createMintForContract(
    resources: MintIngestorResources,
    contractOptions: MintContractOptions,
  ): Promise<MintTemplate> {

    const isCompatible = await this.supportsContract(resources, contractOptions);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Contract not supported');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Foundation');

    if (contractOptions.url) {
      mintBuilder.setMarketingUrl(contractOptions.url);
    }

    const collection = await getFoundationMintByAddress(resources, contractOptions);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    const contractAddress = collection.contractAddress;

    const description = collection?.description;
    const image = collection?.media.url;

    mintBuilder.setName(collection.name).setDescription(description).setFeaturedImageUrl(image);
    mintBuilder.setMintOutputContract({ chainId: 8453, address: contractAddress });

    if (collection.coverImageUrl) {
      mintBuilder.addImage(collection.coverImageUrl, 'cover-image');
    }

    if (!collection.creator) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Error finding creator');
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

    if (!totalPriceWei) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Price not available');
    }

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress: CONTRACT_ADDRESS,
      contractMethod:
        collection.saleType === 'FIXED_PRICE_DROP'
          ? 'mintFromFixedPriceSaleV2'
          : 'mintFromDutchAuctionV2',
      contractParams:
        collection.saleType === 'FIXED_PRICE_DROP'
          ? `["${collection.contractAddress}", 1, address, "0x0000000000000000000000000000000000000000"]`
          : `["${collection.contractAddress}", 1, address]`,
      abi: FOUNDATION_MINT_ABI,
      priceWei: totalPriceWei,
    });

    const now = new Date();
    const nowUTCString = now.toISOString();

    const liveDate =
      new Date() > collection.generalAvailabilityStartTime
        ? new Date(nowUTCString)
        : new Date(collection.generalAvailabilityStartTime);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(collection.generalAvailabilityStartTime ? `${collection.generalAvailabilityStartTime}Z` : nowUTCString))
      .setAvailableForPurchaseEnd(new Date(collection.endTime ? `${collection.endTime}Z` : '2030-01-01T00:00:00Z'))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(
    resources: MintIngestorResources,
    url: string,
  ): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    // Example URL: https://foundation.app/mint/base/0x0C92Ce2aECc651Dd3733008A301f126662ae4A50
    const splits = url.split('/');
    const tokenAddress = splits.pop();
    const chain = splits.pop();

    if (!chain || !tokenAddress) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Url error');
    }

    const chainId = getChainId(chain);
    return this.createMintForContract(resources, { chainId, contractAddress: tokenAddress, url});
  }
}
