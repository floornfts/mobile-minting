import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { getCoinbaseWalletCreator } from './offchain-metadata';
import { MINT_CONTRACT_ABI } from './abi';
import { getCoinbaseWalletMetadata, getCoinbaseWalletPriceInWei } from './onchain-metadata';

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
    const collection = await getCoinbaseWalletMetadata(8453, contractOptions.contractAddress, resources.alchemy);
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
      .setPartnerName('CoinbaseWallet');

    if (contractOptions.url) {
      mintBuilder.setMarketingUrl(contractOptions.url);
    }

    const collectionMetadata = await getCoinbaseWalletMetadata(
      8453,
      contractOptions.contractAddress as string,
      resources.alchemy,
    );

    if (!collectionMetadata) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'No such collection');
    }

    const contractAddress = contractOptions.contractAddress;
    const description = collectionMetadata.description;
    const formattedImage = `https://ipfs.io/ipfs/${collectionMetadata.image.split('//').pop()}`;

    mintBuilder.setName(collectionMetadata.name).setDescription(description).setFeaturedImageUrl(formattedImage);
    mintBuilder.setMintOutputContract({ chainId: 8453, address: contractAddress });

    // Some collections creators do not have valid metadata, only address
    const creator = await getCoinbaseWalletCreator(resources, collectionMetadata.creator);

    mintBuilder.setCreator({
      name: creator?.name ?? '',
      walletAddress: collectionMetadata.creator,
      imageUrl: creator?.avatar,
    });

    const totalPriceWei = await getCoinbaseWalletPriceInWei(8453, contractAddress, resources.alchemy);

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

    const liveDate =
      +new Date() > collectionMetadata.startTime * 1000 ? new Date() : new Date(collectionMetadata.startTime * 1000);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(+collectionMetadata.startTime * 1000 || Date.now()))
      .setAvailableForPurchaseEnd(new Date(+collectionMetadata.endTime * 1000 || '2030-01-01'))
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
    const contractAddress = collectionDescriptorSplit.pop() as string;
    collectionDescriptorSplit.pop();
    const chainId = collectionDescriptorSplit.pop() as string;

    const collectionMetadata = await getCoinbaseWalletMetadata(+chainId, contractAddress as string, resources.alchemy);

    if (!collectionMetadata) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'No such collection');
    }

    return this.createMintForContract(resources, {
      chainId: 8453,
      contractAddress,
      url,
    });
  }
}
