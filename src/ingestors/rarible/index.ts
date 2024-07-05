
// import { MintContractOptions, MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintContractOptions, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintInstructionType } from '../../lib/types/mint-template';
import {  MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { raribleOnchainDataFromUrl, urlForValidRaribleCollection } from "./offchain-metadata";
import { getRaribleContractMetadata, getRaribleMintPriceInEth } from './onchain-metadata';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { RARIBLE_ABI } from './abi';

export class RaribleIngestor {

    configuration = {
        supportsContractIsExpensive: true,
    };
    
    async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
        if (new URL(url).hostname !== 'www.rarible.com' && new URL(url).hostname !== 'rarible.com') {
            return false;
        }
             
        const { chainId,  contractAddress } = await await raribleOnchainDataFromUrl(url)
        return !!chainId && !!contractAddress
    }   

    async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
        const { chainId, contractAddress } = contract;
        if (!chainId || !contractAddress) {
          return false;
        }
    
        const url = await urlForValidRaribleCollection(chainId, contractAddress);
        return !!url;
    }
    

    async createMintTemplateForUrl(resources: MintIngestorResources, url: string): Promise<MintTemplate> {
        const isCompatible = await this.supportsUrl(resources, url);
        if (!isCompatible) {
          throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
        }

        const { chainId, contractAddress } = await raribleOnchainDataFromUrl(url);
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

        const isValid = await urlForValidRaribleCollection(chainId, contractAddress)

        if (!isValid) {
          throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
        }
        const mintBuilder = new MintTemplateBuilder()
            .setMintInstructionType(MintInstructionType.EVM_MINT)
            .setPartnerName('Rarible');

        if (contract.url) {
            mintBuilder.setMarketingUrl(contract.url);
        }
        
       const { 
            name, 
            description, 
            imageURI, 
            unitMintPrice, 
            unitMintTokenAddress, 
            unitPerWallet, 
            conditionProof, 
            ownerAddress,
            startDate,
            stopDate
        } = await getRaribleContractMetadata(chainId, contractAddress, resources.alchemy)
      
        mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(imageURI);
        mintBuilder.setMintOutputContract({ chainId: chainId, address: contractAddress });
        mintBuilder.setCreator({
                name: 'not available',
                walletAddress: ownerAddress,
        });

        let totalPriceWei;
        if (unitMintTokenAddress == '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' || unitMintTokenAddress == '0x4200000000000000000000000000000000000006') {
            totalPriceWei = unitMintPrice;
        } else {
            totalPriceWei = await getRaribleMintPriceInEth(unitMintPrice, unitMintTokenAddress);
        }

       mintBuilder.setMintInstructions({
            chainId,
            contractAddress,
            contractMethod: 'claim',
            contractParams: `[address, 1, ${unitMintTokenAddress}, ${unitMintPrice}, ${conditionProof}, ${unitPerWallet}, ${unitMintPrice}, ${unitMintTokenAddress}, ${'0x'}]`,
            abi: RARIBLE_ABI,
            priceWei: totalPriceWei,
        });

        const liveDate = new Date() > startDate ? new Date() : startDate;
        const purchaseEnd = Number(stopDate) > 0 ? stopDate : new Date('2030-01-01');
        
        mintBuilder
            .setAvailableForPurchaseEnd(purchaseEnd)
            .setAvailableForPurchaseStart(startDate || new Date())
            .setLiveDate(liveDate);

        return mintBuilder.build();
    }
}