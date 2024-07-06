import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { OPENSEA_PROXY_ABI } from './abi';
import { getOpenSeaDropContractMetadata, getOpenSeaDropPriceInEth, urlForValidOpenSeaDropContract } from './onchain-metadata';

export class OpenSeaIngestor implements MintIngestor {

  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    return false; // This ingestor does not support ingesting via URL
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    const { chainId, contractAddress } = contract;
    if (!chainId || !contractAddress) {
      return false;
    }

    const url = await urlForValidOpenSeaDropContract(chainId, contractAddress, resources.alchemy);

    return !!url;
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<any> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    return false; // This ingestor does not support ingesting via URL
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {

    const { chainId, contractAddress } = contract;
    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('OpenSea');


    const url = await urlForValidOpenSeaDropContract(chainId, contractAddress, resources.alchemy);
    
    if (url) {
      mintBuilder.setMarketingUrl(url);
    }

    const { name, description, image, startDate, endDate, creatorName, creatorWebsite } = await getOpenSeaDropContractMetadata(
      chainId,
      contractAddress,
      resources.alchemy,
    );

    mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(image);
    mintBuilder.setCreator({
      name: creatorName,
      websiteUrl: creatorWebsite
    })

    const totalPriceWei = await getOpenSeaDropPriceInEth(chainId, contractAddress, resources.alchemy);

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress,
      contractMethod: 'mintSeaDrop',
      contractParams: '[address, 1]',
      abi: OPENSEA_PROXY_ABI,
      priceWei: totalPriceWei,
    });

    const liveDate = new Date() > startDate ? new Date() : startDate;
    mintBuilder
      .setAvailableForPurchaseEnd(endDate || new Date('2030-01-01'))
      .setAvailableForPurchaseStart(startDate || new Date())
      .setLiveDate(liveDate);

    const output = mintBuilder.build();
    return output;
  }
}