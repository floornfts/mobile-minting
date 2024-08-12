import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { getRodeoMintByAddressAndChain, getRodeoMintByURL, rodeoSupports } from './offchain-metadata';

import { BigNumber } from 'alchemy-sdk';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { RODEO_ABI } from './abi';
import { getRodeoFeeInEth } from './onchain-metadata';

export class RodeoIngestor implements MintIngestor {
  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    if (new URL(url).hostname !== 'rodeo.club') {
      return false;
    }
    try {
      const { chainId, contractAddress, tokenId } = await getRodeoMintByURL(resources, url);
      return !!chainId && !!contractAddress && !!tokenId;
    } catch (error) {
      return false;
    }
  }

  async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
    const { chainId, contractAddress, tokenId } = contract;
    if (!chainId || !contractAddress || !tokenId) {
      return false;
    }
    return await rodeoSupports(contract, resources);
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const { chainId, contractAddress, tokenId } = await getRodeoMintByURL(resources, url);

    if (!chainId || !contractAddress || !tokenId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    return this.createMintForContract(resources, { chainId, contractAddress, url, tokenId });
  }

  async createMintForContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<MintTemplate> {
    const { chainId, contractAddress, tokenId } = contract;
    if (!chainId || !contractAddress || !tokenId) {
      throw new MintIngestorError(MintIngestionErrorName.MissingRequiredData, 'Missing required data');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('RodeoClub');

    if (contract.url) {
      mintBuilder.setMarketingUrl(contract.url);
    }

    // asides name and image no other metadata we need is onchain so we can just use the offchain metadata
    const {
      name,
      image,
      description,
      priceInWei,
      mintAddress,
      public_sale_start_at,
      public_sale_end_at,
      sale_terms_id,
      user,
    } = await getRodeoMintByAddressAndChain(
      resources,
      contract.chainId,
      contract.contractAddress,
      contract.tokenId as string,
    );

    mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(image);
    const fee = await getRodeoFeeInEth(sale_terms_id, user.address, mintAddress, resources.alchemy);
    const totalPrice = BigNumber.from(priceInWei).add(BigNumber.from(fee)).toString();

    mintBuilder.setMintOutputContract({
      chainId,
      address: contractAddress,
    });

    mintBuilder.setCreator({
      name: user.name,
      imageUrl: user.image,
    });

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress: mintAddress,
      contractMethod: 'mintFromFixedPriceSale',
      contractParams: `[${sale_terms_id}, 1, address, "${user.address}"]`,
      abi: RODEO_ABI,
      priceWei: totalPrice,
    });

    const startDate = public_sale_start_at ? new Date(public_sale_start_at) : new Date();
    const endDate = public_sale_end_at ? new Date(public_sale_end_at) : null;

    const liveDate = new Date() > startDate ? new Date() : startDate;
    mintBuilder
      .setAvailableForPurchaseEnd(endDate || new Date('2030-01-01'))
      .setAvailableForPurchaseStart(startDate || new Date())
      .setLiveDate(liveDate);

    const output = mintBuilder.build();
    return output;
  }
}
