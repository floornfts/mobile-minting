import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { zoraMintAbi } from './abi';
import {  getZoraMintPriceInEth,getZoraContractMetadata } from './onchain-zora';
import { fetchCreatorProfile, urlForValidZoraPage,zoraOnchainIdDataFromUrl } from './offchain-metadata';

export class ZoraIngestor implements MintIngestor {

  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
    const urlObject = new URL(url);
    return urlObject.hostname === 'zora.co' && urlObject.pathname.startsWith('/collect/base');
  }
  
  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    const { contractAddress,tokenId } = contract;
    if (!contractAddress || !tokenId) {
      return false;
    }
    const url = await urlForValidZoraPage( contractAddress,tokenId, resources.fetcher);
    return !!url;
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const { chainId,tokenId, contractAddress } = await zoraOnchainIdDataFromUrl(url, resources.fetcher);
    if (!chainId || !contractAddress || !tokenId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }
    return this.createMintForContract(resources, {chainId, contractAddress,tokenId, url });
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {
    const { chainId, contractAddress,tokenId } = contract;
    if (!chainId || !contractAddress || !tokenId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('Zora');
      
    const { name, description, imageUrl,startAt,creatorAddress } = await getZoraContractMetadata(Number(tokenId), contractAddress);
    mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(imageUrl);
    const totalPriceWei = await getZoraMintPriceInEth(chainId, contractAddress, resources.alchemy);
    mintBuilder.setMintInstructions({
      chainId,
      contractAddress,
      contractMethod: 'mintWithRewards',
      contractParams: '[address,1,1,bytes,address]',
      abi: zoraMintAbi,
      priceWei: totalPriceWei,
    });
    const token=await fetchCreatorProfile(creatorAddress,resources.fetcher);
    mintBuilder.setCreator({
      name: token.username,
      imageUrl: token.avatar,
      walletAddress: token.address,
      description: token.description,
      twitterUsername: token.extension.links.twitter,
      farcasterUsername: token.extension.links.farcaster,
      tikTokUsername: token.extension.links.tiktok,
      instagramUsername: token.extension.links.instagram,
      discordUsername: token.extension.links.discord,
      websiteUrl: token.extension.links.website,
    })
    
    const startAtDate = new Date(startAt);
    const liveDate = new Date() > startAt ? new Date() : startAt;
    mintBuilder
      .setAvailableForPurchaseStart(startAtDate)
      .setLiveDate(liveDate);

    const output = mintBuilder.build();
    return output;
  }
}
