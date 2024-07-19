import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { PROHIBITION_DAILY_ABI } from './abi';
import { getProhibitionContractMetadata, getProhibitionMintPriceInEth } from './onchain-metadata';
import { prohibitionOnchainDataFromUrl, urlForValidProhibitionPage } from './offchain-metadata';

export class ProhibitionDailyIngestor implements MintIngestor {

  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    if (new URL(url).hostname !== 'daily.prohibition.art') {
      return false;
    }
    const { chainId, contractAddress } = await prohibitionOnchainDataFromUrl(url);
    return !!chainId && !!contractAddress;
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    const { chainId, contractAddress } = contract;
    if (!chainId || !contractAddress) {
      return false;
    }

    const url = await urlForValidProhibitionPage(chainId, contractAddress, resources.fetcher);
    return !!url;
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const { chainId, contractAddress } = await prohibitionOnchainDataFromUrl(url);

    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }
            
    return this.createMintForContract(resources, { chainId, contractAddress, url });
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {

    const { chainId, contractAddress } = contract;
    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Prohibition');

    if (contract.url) {
      mintBuilder.setMarketingUrl(contract.url);
    }

    const { name, description, image, startDate, endDate } = await getProhibitionContractMetadata(
      chainId,
      contractAddress,
      resources.alchemy,
    );

    mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(image);

    const totalPriceWei = await getProhibitionMintPriceInEth(chainId, contractAddress, resources.alchemy);

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress,
      contractMethod: 'mint',
      contractParams: '[address, 1]',
      abi: PROHIBITION_DAILY_ABI,
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
