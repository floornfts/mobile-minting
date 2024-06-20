import { MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { PROHIBITION_DAILY_ABI } from './abi';
import { getProhibitionContractMetadata, getProhibitionMintPriceInEth } from './onchain-metadata';

export class ProhibitionDailyIngestor implements MintIngestor {
  async supportsUrl(url: string): Promise<boolean> {
    return new URL(url).hostname === 'daily.prohibition.art';
  }

  async createMintTemplateForUrl(url: string, resources: MintIngestorResources): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setOriginalUrl(url)
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Prohibition');

    // https://daily.prohibition.art/mint/8453/0x20479b19ca05e0b63875a65acf24d81cd0973331
    const urlParts = url.split('/');
    const contractAddress = urlParts.pop();
    const chainId = parseInt(urlParts.pop() || '');

    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
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
