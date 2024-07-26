import { MintContractOptions, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintInstructionType } from '../../lib/types/mint-template';
import {  MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { raribleOnchainDataFromUrl, raribleUrlForValidBaseEthCollection, raribleCreatorProfileDataGetter } from "./offchain-metadata";
import { raribleContractMetadataGetter} from './onchain-metadata';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { RARIBLE_ABI } from './abi';

export class RaribleIngestor {
    async supportsUrl(_resources: MintIngestorResources, url: string): Promise<boolean> {
        if (new URL(url).hostname !== 'www.rarible.com' && new URL(url).hostname !== 'rarible.com') {
            return false;
        }
             
        const { chainId,  contractAddress } = await raribleOnchainDataFromUrl(url)
        return !!chainId && !!contractAddress
    }   
       
    async supportsContract(resources: MintIngestorResources, contract: MintContractOptions): Promise<boolean> {
        const { chainId, contractAddress } = contract;
        if (!chainId || !contractAddress) {
          return false;
        }
        const url = await raribleUrlForValidBaseEthCollection(chainId, contractAddress, resources.alchemy);
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
        
        const isValid = await raribleUrlForValidBaseEthCollection(chainId, contractAddress, resources.alchemy)
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
        } = await raribleContractMetadataGetter(chainId, contractAddress, resources.alchemy)
        
        const {
            pName,
            pImageUrl,
            pDescription,
            pWebsiteUrl, 
        } = await raribleCreatorProfileDataGetter(ownerAddress);
        
        mintBuilder.setName(name).setDescription(description).setFeaturedImageUrl(imageURI);
        mintBuilder.setMintOutputContract({ chainId: chainId, address: contractAddress });
        mintBuilder.setCreator({
                name: pName,
                imageUrl: pImageUrl,
                description: pDescription,
                websiteUrl: pWebsiteUrl,
                walletAddress: ownerAddress,
        });

        mintBuilder.setMintInstructions({
            chainId,
            contractAddress,
            contractMethod: 'claim',
            contractParams: `[address, 1, "${unitMintTokenAddress}", "${unitMintPrice.toString()}", [["${conditionProof}"], ${unitPerWallet}, "${unitMintPrice.toString()}", "${unitMintTokenAddress}"], "${'0x'}"]`,
            abi: RARIBLE_ABI,
            priceWei: unitMintPrice.toString(),
        });

        const liveDate = new Date() > startDate ? new Date() : startDate;
        
        mintBuilder
            .setAvailableForPurchaseEnd(stopDate)
            .setAvailableForPurchaseStart(startDate)
            .setLiveDate(liveDate);

        return mintBuilder.build();
    }
}