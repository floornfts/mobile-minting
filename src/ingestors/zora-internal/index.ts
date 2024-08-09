import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { ZoraSourceTranslator } from './zora-sources';
import { ZoraMetadataProvider } from './offchain-metadata';

export class ZoraInternalIngestor implements MintIngestor {
  configuration = {
    supportsContractIsExpensive: true,
    supportsUrlIsExpensive: true,
  };

  zoraSourceTranslator = new ZoraSourceTranslator();
  zoraMetadataProvider = new ZoraMetadataProvider();

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    if (!url.startsWith('https://zora.co/collect/')) {
      return false;
    }

    try {
      const { chainId, contractAddress } = await this.zoraSourceTranslator.tokenDetailsFromUrl(url);
      return !!chainId && !!contractAddress;
    } catch (error) {
      return false;
    }
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    try {
      const url = await this.zoraSourceTranslator.urlForZoraContract(contract, resources.fetcher);
      return !!url;
    } catch (error) {
      return false;
    }
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    try {
      const { chainId, contractAddress, tokenId } = await this.zoraSourceTranslator.tokenDetailsFromUrl(url);
      return this.createMintForContract(resources, { chainId, contractAddress, tokenId, url });
    } catch (error) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {
    const { chainId, contractAddress, tokenId } = contract;
    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Zora');

    const url = await this.zoraSourceTranslator.urlForZoraContract(contract, resources.fetcher);
    mintBuilder.setMarketingUrl(url);

    const tokenDetails = await this.zoraMetadataProvider.getMetadataForToken(
      chainId,
      contractAddress,
      tokenId,
      resources.fetcher,
    );

    mintBuilder
      .setName(tokenDetails.metadata?.name || tokenDetails.collection.name)
      .setDescription(tokenDetails.metadata?.description || tokenDetails.collection.description || '')
      .setFeaturedImageUrl(tokenDetails.media?.image_preview?.raw);

    mintBuilder.setCreator({
      name: tokenDetails.creator_profile.display_name,
      walletAddress: tokenDetails.creator_profile.address,
      imageUrl: tokenDetails.creator_profile.avatar,
    });

    const mintInstructions = await this.zoraMetadataProvider.mintInstructionsForToken(tokenDetails);
    mintBuilder.setMintInstructions(mintInstructions);

    const startDate = tokenDetails.mintable?.start_datetime
      ? new Date(tokenDetails.mintable.start_datetime)
      : new Date();
    const endDate = tokenDetails.mintable?.end_datetime
      ? new Date(tokenDetails.mintable.end_datetime)
      : new Date('2030-01-01');
    const liveDate = new Date() > startDate ? new Date() : startDate;
    mintBuilder.setAvailableForPurchaseEnd(endDate).setAvailableForPurchaseStart(startDate).setLiveDate(liveDate);

    const output = mintBuilder.build();
    return output;
  }
}
