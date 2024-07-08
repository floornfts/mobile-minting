import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { MANIFOLD_CLAIMS_ABI } from './abi';
import { getManifoldMintPriceInEth } from './onchain-metadata';
import { manifoldOnchainDataFromUrl } from './offchain-metadata';

export class ManifoldIngestor implements MintIngestor {

  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    if (new URL(url).hostname !== 'app.manifold.xyz') {
      return false;
    }
    const { chainId, contractAddress } = await manifoldOnchainDataFromUrl(url, resources.fetcher);

    // Check if the chainId is not 8453
    if (chainId !== 8453) {
      return false;
    } 
    
    return !!chainId && !!contractAddress;
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    const { chainId, contractAddress } = contract;
    if (!chainId || !contractAddress) {
      return false;
    }

    return false;
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const { chainId, contractAddress } = await manifoldOnchainDataFromUrl(url, resources.fetcher);

    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    return this.createMintForContract(resources, { chainId, contractAddress, url });
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {

    const { chainId, contractAddress, url: mintUrl } = contract;
    if (!chainId || !contractAddress) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    if (!mintUrl) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing mint URL');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Manifold'); 

    if (mintUrl) {
      mintBuilder.setMarketingUrl(mintUrl);
    }

    const metadata  = await manifoldOnchainDataFromUrl(mintUrl, resources.fetcher);
    
    mintBuilder
      .setName(metadata.name)
      .setDescription(metadata.description)
      .setFeaturedImageUrl(metadata.imageUrl);

    mintBuilder.setCreator({
      name: metadata.creatorName,
      walletAddress: metadata.creatorAddress
    })

    const totalPriceWei = await getManifoldMintPriceInEth(chainId, contractAddress, metadata.mintPrice, resources.alchemy);

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress,
      contractMethod: 'mintBaseNew',
      contractParams: '[address, 1, ...]',
      abi: MANIFOLD_CLAIMS_ABI,
      priceWei: totalPriceWei,
    });

    const liveDate = new Date() > metadata.startDate ? new Date() : metadata.startDate;
    mintBuilder
      .setAvailableForPurchaseEnd(metadata.endDate || new Date('2030-01-01'))
      .setAvailableForPurchaseStart(metadata.startDate || new Date())
      .setLiveDate(liveDate);

    const output = mintBuilder.build();
    return output;
  }
}