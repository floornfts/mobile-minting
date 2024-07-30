import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { getCoinbaseWalletCollectionByAddress, getCoinbaseWalletCreator } from './offchain-metadata';
import { MINT_CONTRACT_ABI } from './abi';

export class CoinbaseWalletIngestor implements MintIngestor {
  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    const collectionDescriptor = url.split('/').pop();
    if (!collectionDescriptor) {
      return false;
    }
    const collectionDescriptorSplit = collectionDescriptor.split(':');
    if (collectionDescriptorSplit.length !== 4) return false;
    if (collectionDescriptorSplit[1] !== '8453') return false;

    return new URL(url).hostname === 'www.wallet.coinbase.com' || new URL(url).hostname === 'wallet.coinbase.com';
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (contractOptions.chainId !== 8453) {
      return false;
    }
    const collection = await getCoinbaseWalletCollectionByAddress(resources, contractOptions.contractAddress);
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

    const collection = await getCoinbaseWalletCollectionByAddress(resources, contractOptions.contractAddress);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    const contractAddress = collection.address;
    const description = collection.description;
    const formattedImage = `https://ipfs.io/ipfs/${collection.imageUrl.split('//').pop()}`

    mintBuilder
      .setName(collection.name)
      .setDescription(description)
      .setFeaturedImageUrl(formattedImage);
    mintBuilder.setMintOutputContract({ chainId: 8453, address: contractAddress });

    // Some collections creators do not have valid metadata, only address
    const creator = await getCoinbaseWalletCreator(resources, collection.creatorAddress);

    mintBuilder.setCreator({
      name: creator?.name ?? '',
      walletAddress: collection.creatorAddress,
      imageUrl: creator?.avatar,
    });

    const publicSale = collection.stages.find(stage => stage.stage === 'public-sale');
    const totalPriceWei = publicSale?.price.Amount.Raw;

    if (!totalPriceWei) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Price not available');
    }

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress,
      contractMethod: 'mintWithComment',
      contractParams: `[address, 1, ""]`,
      abi: MINT_CONTRACT_ABI,
      priceWei: totalPriceWei,
    });

    const liveDate = +new Date() > +publicSale.startTime * 1000 ? new Date() : new Date(+publicSale.startTime * 1000);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(+publicSale.startTime * 1000 || Date.now()))
      .setAvailableForPurchaseEnd(new Date(+publicSale.endTime * 1000 || '2030-01-01'))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const collectionDescriptor = url.split('/').pop();
    if (!collectionDescriptor) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Url error');
    }

    const collectionDescriptorSplit = collectionDescriptor.split(':');

    const collection = await getCoinbaseWalletCollectionByAddress(resources, collectionDescriptorSplit.pop() as string);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'No such collection');
    }

    return this.createMintForContract(resources, {
      chainId: 8453,
      contractAddress: collection.address,
      url,
    });
  }
}
