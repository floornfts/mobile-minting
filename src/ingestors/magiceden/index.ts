import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import {
  getMagicEdenCollectionByAddress,
  getMagicEdenCollectionBySlug,
  getMagicEdenMintInstructions,
} from './offchain-metadata';
import { MAGIC_EDEN_ABI } from './abi';

export class MagicEdenIngestor implements MintIngestor {
  async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
    const splitUrl = url.split('/');
    splitUrl.pop();
    const chain = splitUrl.pop();
    if (chain !== 'base') {
      return false;
    }
    const launchpad = splitUrl.pop();
    if (launchpad !== 'launchpad') {
      return false;
    }
    return new URL(url).hostname === 'www.magiceden.io' || new URL(url).hostname === 'magiceden.io';
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    if (contract.chainId !== 8453) {
      return false;
    }
    const token = await getMagicEdenCollectionByAddress(resources, contract);
    if (!token) {
      return false;
    }
    return true;
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {
    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('MagicEden');

    if (contract.url) {
      mintBuilder.setMarketingUrl(contract.url);
    }

    const collection = await getMagicEdenCollectionByAddress(resources, contract);


    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
    }

    const mintInstruction = await getMagicEdenMintInstructions(resources, collection.id);

    const priceWei = String(parseInt(mintInstruction?.value ?? 0x0));

    mintBuilder.setName(collection.name).setDescription(collection.description).setFeaturedImageUrl(collection.image);
    mintBuilder.setMintOutputContract({ chainId: contract.chainId, address: contract.contractAddress });
    mintBuilder.setCreator({
      name: '',
      walletAddress: collection.creator,
    });

    collection.sampleImages.forEach((imgUrl, index) => mintBuilder.addImage(imgUrl, `Sample-image-${index}`))

    mintBuilder.setMintInstructions({
      chainId: 8453,
      contractAddress: collection.id,
      contractMethod: 'mint',
      contractParams: mintInstruction.data,
      abi: MAGIC_EDEN_ABI,
      priceWei,
    });

    const liveDate = +new Date() > +new Date(collection.createdAt) ? new Date() : new Date(collection.createdAt);
    mintBuilder
      .setAvailableForPurchaseStart(new Date(collection.createdAt || Date.now()))
      .setAvailableForPurchaseEnd(new Date('2030-01-01T00:00:00.000Z'))
      .setLiveDate(liveDate);

    return mintBuilder.build();
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const slug = url.split('/').pop();

    const collection = await getMagicEdenCollectionBySlug(resources, slug);

    if (!collection) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Collection not found');
    }

    const dropAddress = collection.id;
    const chainId = collection.chainId;

    if (!chainId) {
      throw new MintIngestorError(MintIngestionErrorName.MintUnsupportedNetwork, 'Chain not supported');
    }

    return this.createMintForContract(resources, { chainId, contractAddress: dropAddress, url });
  }
}
