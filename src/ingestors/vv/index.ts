import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import {
  getVvMintPriceInWei,
  getVvLatestTokenId,
  getVvCollectionCreator,
  getVvCollectionMetadata,
} from './onchain-metadata';
import { getVvCollection } from './onchain-metadata';
import { MINT_CONTRACT_ABI } from './abi';

// https://mint.vv.xyz/0xcb52f0fe1d559cd2869db7f29753e8951381b4a3/1
export class VvIngestor implements MintIngestor {
  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    const splitUrl = url.split('/');
    const tokenId = splitUrl.pop();
    const address = splitUrl.pop();
    if (!tokenId || !address) {
      return false;
    }

    const collection = await getVvCollection(resources.alchemy, address as string, +tokenId);
    if (!collection) return false;

    const urlPattern = /^https:\/\/mint\.vv\.xyz\/0x[a-fA-F0-9]{40}\/\d+$/;
    return (
      new URL(url).hostname === 'www.mint.vv.xyz' || new URL(url).hostname === 'mint.vv.xyz' || urlPattern.test(url)
    );
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (!(contractOptions.chainId === 1 || contractOptions.chainId === 8453)) {
      return false;
    }
    const collection = await getVvCollection(
      resources.alchemy,
      contractOptions.contractAddress,
      contractOptions.tokenId ? +contractOptions.tokenId : undefined,
    );
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

    const { contractAddress } = contractOptions;
    const tokenId = contractOptions.tokenId ?? (await getVvLatestTokenId(resources.alchemy, contractAddress));

    const collection = await getVvCollection(resources.alchemy, contractAddress, tokenId ? +tokenId : undefined);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    const metadata = await getVvCollectionMetadata(resources.alchemy, contractAddress);

    if (!metadata) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection metadata not found');
    }

    mintBuilder.setName(metadata.name).setDescription(metadata.description).setFeaturedImageUrl(metadata.image);
    mintBuilder.setMintOutputContract({ chainId: 1, address: contractAddress });

    const creatorData = await getVvCollectionCreator(resources.alchemy, contractAddress);

    if (!creatorData) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Error finding creator');
    }

    const { creator, name: creatorName } = creatorData;

    mintBuilder.setCreator({
      name: creatorName || '',
      walletAddress: creator,
    });

    mintBuilder.setMintOutputContract({ chainId: 1, address: contractAddress });

    const totalPriceWei = await getVvMintPriceInWei(resources.alchemy, contractAddress, collection.mintedBlock);

    if (!totalPriceWei) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Price not available');
    }

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress,
      contractMethod: 'mint',
      contractParams: `[${tokenId}, quantity]`,
      abi: MINT_CONTRACT_ABI,
      priceWei: totalPriceWei,
      supportsQuantity: true,
    });

    const { closeAt } = collection;

    // Tokens are open to be minted for 24 hours after token creation.
    const startTimestamp = new Date(closeAt * 1000 - 24 * 60 * 60 * 1000);
    const liveDate = +new Date() > +startTimestamp ? new Date() : startTimestamp;
    mintBuilder
      .setAvailableForPurchaseStart(new Date(startTimestamp || Date.now()))
      .setAvailableForPurchaseEnd(new Date(closeAt * 1000))
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
    const contract = splits.pop();

    if (!id || !contract) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Url error');
    }

    const collection = await getVvCollection(resources.alchemy, contract, +id);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'No such collection');
    }

    return this.createMintForContract(resources, {
      chainId: 1,
      contractAddress: contract,
      url,
    });
  }
}