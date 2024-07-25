import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { MANIFOLD_CLAIMS_ABI } from './abi';
import { getManifoldMintPriceInEth, urlForValidManifoldContract } from './onchain-metadata';
import { manifoldOnchainDataFromUrl } from './offchain-metadata';

const MANIFOLD_LAZY_PAYABLE_CLAIM_CONTRACT = "0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE";
export class ManifoldIngestor implements MintIngestor {

  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    if (new URL(url).hostname !== 'app.manifold.xyz') {
      return false;
    }
  
    const slug = url.split('/').pop() || '';
  
    try {
      const { data } = await resources.fetcher.get(`https://apps.api.manifoldxyz.dev/public/instance/data?appId=2522713783&instanceSlug=${slug}`);
      const { publicData } = data || {};
      const { network: chainId, contract: contractAddress } = publicData || {};
  
      if (chainId !== 8453) {
        return false;
      }
  
      return !!chainId && !!contractAddress;

    } catch (error) {
      return false;
    }
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    const { chainId, contractAddress } = contract;

    if (!chainId || !contractAddress) {
      return false;
    }

    if (chainId !== 8453) {
      return false;
    }

    if (!contractAddress.startsWith('0x')) {
      return false;
    }

    if (contractAddress.length !== 42) {
      return false;
    }

    const url = await urlForValidManifoldContract(chainId, contractAddress, resources.alchemy, resources.fetcher);
    return !!url;
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

    const { chainId, contractAddress } = contract;

    if (!contract.url) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Ingesting via contract address not supported');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Manifold');

  
    if (contract.url) {
      mintBuilder.setMarketingUrl(contract.url);
    }

    const metadata  = await manifoldOnchainDataFromUrl(contract.url, resources.fetcher);

    mintBuilder
      .setName(metadata.name)
      .setDescription(metadata.description)
      .setFeaturedImageUrl(metadata.imageUrl);

    mintBuilder.setCreator({
      name: metadata.creatorName,
      walletAddress: metadata.creatorAddress
    })

    const totalPriceWei = await getManifoldMintPriceInEth(metadata.mintPrice);

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress: MANIFOLD_LAZY_PAYABLE_CLAIM_CONTRACT,
      contractMethod: 'mintProxy',
      contractParams: `["${contractAddress}", "${metadata.instanceId}", 1, [], [], address]`,
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
