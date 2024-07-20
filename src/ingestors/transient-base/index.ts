import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import {
  getTransientBaseMintByAddressAndChain,
  getTransientBaseMintByURL,
  transientSupports,
} from './offchain-metadata';

import { BigNumber } from 'alchemy-sdk';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { TRANSIENT_BASE_ABI } from './abi';
import { getTransientProtocolFeeInEth } from './onchain-metadata';

export class TransientIngestor implements MintIngestor {
  configuration = {
    supportsContractIsExpensive: true,
  };

  async supportsUrl(resources: MintIngestorResources, url: string): Promise<boolean> {
    if (new URL(url).hostname !== 'www.transient.xyz') {
      return false;
    }
    try {
      const { chainId, contractAddress } = await getTransientBaseMintByURL(resources, url);
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
    return await transientSupports(contract, resources.fetcher);
  }

  async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(resources, url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const { chainId, contractAddress } = await getTransientBaseMintByURL(resources, url);

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
      .setPartnerName('Transient');

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
      token_id,
      user,
    } = await getTransientBaseMintByAddressAndChain(resources, contract.chainId, contract.contractAddress);

    mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(image);
    const protocolFee = await getTransientProtocolFeeInEth(chainId, mintAddress, resources.alchemy);
    const totalPrice = BigNumber.from(priceInWei).add(BigNumber.from(protocolFee)).toString();

    mintBuilder.setMintOutputContract({
      chainId,
      address: contractAddress,
    });

    mintBuilder.setCreator({
      name: user.name,
      imageUrl: user.image,
      websiteUrl: user.website,
    });

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress: mintAddress,
      contractMethod: 'purchase',
      contractParams: `["${contractAddress}", ${token_id}, address, 1, 0, []]`,
      abi: TRANSIENT_BASE_ABI,
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
