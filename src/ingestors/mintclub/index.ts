import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { MINTCLUB_ZAP_ABI } from './abi';
import {
  MINTCLUB_BASE_CHAIN_ID,
  MINTCLUB_ZAP_ADDRESS,
  getMintClubTokenDetails,
  mintClubDescription,
  mintClubFeaturedImageUrl,
  mintClubSymbolFromUrl,
  mintClubUrlForSymbol,
  resolveMintClubTokenForSymbol,
} from './offchain-metadata';
import { MintClubTokenDetails } from './types';

export class MintClubIngestor implements MintIngestor {
  configuration = {
    supportsContractIsExpensive: true,
    supportsUrlIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    const symbol = mintClubSymbolFromUrl(url);
    if (!symbol) {
      return false;
    }

    return !!(await resolveMintClubTokenForSymbol(resources, symbol));
  }

  async supportsContract(resources: MintIngestorResources, contractOptions: MintContractOptions): Promise<boolean> {
    if (contractOptions.chainId !== MINTCLUB_BASE_CHAIN_ID) {
      return false;
    }

    return !!(await getMintClubTokenDetails(resources, contractOptions.contractAddress));
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const symbol = mintClubSymbolFromUrl(url);
    if (!symbol) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const details = await resolveMintClubTokenForSymbol(resources, symbol);
    if (!details) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint Club token not found');
    }

    return this.createMintTemplate(details, url);
  }

  async createMintForContract(
    resources: MintIngestorResources,
    contractOptions: MintContractOptions,
  ): Promise<MintTemplate> {
    if (contractOptions.chainId !== MINTCLUB_BASE_CHAIN_ID) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible chain');
    }

    const details = await getMintClubTokenDetails(resources, contractOptions.contractAddress);
    if (!details) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint Club token not found');
    }

    return this.createMintTemplate(details, contractOptions.url || mintClubUrlForSymbol(details.info.symbol));
  }

  private createMintTemplate(details: MintClubTokenDetails, marketingUrl: string): MintTemplate {
    const startDate = details.info.createdAt
      ? new Date(details.info.createdAt * 1000)
      : new Date();
    const liveDate = new Date() > startDate ? new Date() : startDate;

    return new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Mint Club')
      .setMarketingUrl(marketingUrl)
      .setName(details.info.name)
      .setDescription(mintClubDescription(details))
      .setFeaturedImageUrl(mintClubFeaturedImageUrl(details))
      .setMintOutputContract({
        chainId: MINTCLUB_BASE_CHAIN_ID,
        address: details.info.token,
        tokenId: 0,
      })
      .setCreator({
        name: 'Mint Club Creator',
        walletAddress: details.info.creator,
        websiteUrl: details.metadata?.website || undefined,
      })
      .setMintInstructions({
        chainId: MINTCLUB_BASE_CHAIN_ID,
        contractAddress: MINTCLUB_ZAP_ADDRESS,
        contractMethod: 'mintWithEth',
        contractParams: `["${details.info.token}", 1, address]`,
        abi: MINTCLUB_ZAP_ABI,
        priceWei: details.reserveAmount.toString(),
        supportsQuantity: false,
      })
      .setAvailableForPurchaseStart(startDate)
      .setAvailableForPurchaseEnd(new Date('2030-01-01T00:00:00Z'))
      .setLiveDate(liveDate)
      .build();
  }
}
