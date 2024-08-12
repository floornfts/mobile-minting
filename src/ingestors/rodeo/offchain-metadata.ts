import { AxiosInstance, AxiosResponse } from 'axios';
import { MintContractOptions, MintIngestionErrorName, MintIngestorError, MintIngestorResources } from '../../lib';

/**
 * @param resources MintIngestorResources
 * @param url string ie 'https://rodeo.club/post/0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA/1?utm_source=twitter&utm_medium=tweet&utm_campaign=hot_ones'
 * @returns  { chainId: number, contractAddress: string, image: string , name: string}
 * @throws MintIngestorError
 */
export const getRodeoMintByURL = async (
  resources: MintIngestorResources,
  url: string,
): Promise<{
  chainId: number;
  contractAddress: string;
  image: string;
  name: string;
  mintAddress: string;
  priceInWei: string;
  description: string;
}> => {
  const urlParts = new URL(url);
  const contractAddress = urlParts.pathname.split('/')[2];
  if (!contractAddress || contractAddress.length !== 42) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }
  return await getRodeoMintByAddressAndChain(resources, 8453, contractAddress);
};

export const getRodeoMintByAddressAndChain = async (
  resources: MintIngestorResources,
  chainId: number,
  contractAddress: string,
  tokenId?: string,
) => {
  let response: AxiosResponse;
  try {
    const url = 'https://api-v2.foundation.app/electric/v2/graphql';

    const headers = {
      Accept: '*/*',
    };

    const data = {
      query: `
        query ShopPage($tokenFilter: TokenInput!, $page: Int, $perPage: Limit) {
          token(by: {token: $tokenFilter}, filters: {existenceStatus: ANY}) {
            ...Token
            isDeleted
          }
          tokenHolders(by: {token: $tokenFilter}, page: $page, perPage: $perPage) {
            tokenHolderBalances {
              items {
                ...TokenHolder
              }
              page
              totalItems
              totalPages
            }
            firstMinter {
              ...UserWallet
            }
          }
        }
        
        fragment Token on ERC1155Token {
          chainId
          contractAddress
          name
          description
          mintedCount
          uniqueMintersCount
          commentCount
          tokenId
          saleConfiguration {
            ...SaleConfiguration
          }
          creator {
            ...UserWallet
          }
          media {
            ...Media
          }
        }
        
    
        fragment SaleConfiguration on TokenTimedSaleConfiguration {
          ... on TokenTimedSaleConfiguration {
            saleType
            status
            startTime
            endTime
            mintPrice
            saleTermsId
          }
        }
        
    
        fragment UserWallet on UserWallet {
          user {
            ...User
          }
          wallet {
            address
          }
        }
        
    
        fragment User on User {
          id
          displayName
          username
          imageUrl
        }
        
    
        fragment Media on Media {
          __typename
          ... on ImageMedia {
            processingStatus
            sourceUrl
            url
            width
            height
            blurHash
            imageMimeType: mimeType
          }
          ... on VideoMedia {
            previewUrl
            processingStatus
            sourceUrl
            staticUrl
            url
            width
            height
            videoMimeType: mimeType
          }
        }
        
    
        fragment TokenHolder on TokenHolderBalance {
          count: tokenCount
          holder {
            ...UserWallet
          }
        }
      `,
      variables: {
        tokenFilter: {
          chainId,
          contractAddress,
          tokenId: tokenId || 1,
        },
      },
      operationName: 'ShopPage',
    };

    response = await resources.fetcher.post(url, data, { headers });
  } catch (error) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Could not query mint from Transient API');
  }
// {"data": {"token": {"chainId": 8453, "contractAddress": "0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA", "name": "IMG 0284", "description": null, "mintedCount": 6, "uniqueMintersCount": 6, "commentCount": 2, "tokenId": 1, "saleConfiguration": {"saleType": "TIMED_EDITION", "status": "ENDED", "startTime": "2024-08-06T05:47:19", "endTime": "2024-08-07T05:47:12", "mintPrice": 0.0, "saleTermsId": 5562}, "creator": {"user": {"id": "d5def6bf-c30c-43a5-8d3c-0f526098d00a", "displayName": "\ud83c\udf80 sonya (in theory) \ud83d\udc30", "username": "sonyasupposedly", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/profile_image_36d0244a-039d-424d-94c7-a63273ee7a58.jpeg"}, "wallet": {"address": "0x18FfAD7FEc51119C55368607e43E6a986edaa831"}}, "media": {"__typename": "ImageMedia", "processingStatus": "PROCESSED", "sourceUrl": "ipfs://QmVqD9YfikKw4zUd3ECTzGs22iautS1Pfnk2NPSTsM1nDw", "url": "https://f8n-production-collection-assets.imgix.net/rodeo/8453/0x98E9116a26E1cf014770122b2f5b7EE4Cad067bA/1/nft.jpeg", "width": 4032, "height": 3024, "blurHash": "euFrk%WFScRjX5.ANIn~r?n%TKWVniofnhRjsnWBT0R%RiofaeozWA", "imageMimeType": "IMAGE_JPEG"}, "isDeleted": false}, "tokenHolders": {"tokenHolderBalances": {"items": [{"count": 1, "holder": {"user": {"id": "010fa13e-0451-4142-a5ce-69062d0c7a8b", "displayName": "Anna", "username": "artmonochrome", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/u9rtcd8ld.jpeg"}, "wallet": {"address": "0x207412225ed2B71f06d339179F888dE4AD1A7DbE"}}}, {"count": 1, "holder": {"user": {"id": "f731b910-059f-4ab4-9b67-507e3d3f45be", "displayName": "Jacque(she|her)", "username": "jacque", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/profile_image_264f04fe-0a2e-4a64-8c63-ca64fcb2b168.jpeg"}, "wallet": {"address": "0x20Da700EA03E9fe8bf3409d6F66105184AEfB2FC"}}}, {"count": 1, "holder": {"user": {"id": "c33cd2be-faf4-421c-a9fb-0c4e20d00554", "displayName": "Coop", "username": "coopahtroopa.eth", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/profile_image_24c037d6-10a0-4118-b524-d2457e949a31.gif"}, "wallet": {"address": "0x5B93FF82faaF241c15997ea3975419DDDd8362c5"}}}, {"count": 1, "holder": {"user": {"id": "7324a436-6a26-42fd-8743-045f38d8ce6b", "displayName": "Aoife O\u2019Dwyer", "username": "aoifeodwyer", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/profile_image_46a1b6cd-2fa2-4349-8d9b-bc4faaf590a9.png"}, "wallet": {"address": "0xE588A2b38F24C72e30535885d645CEbA44480D1b"}}}, {"count": 1, "holder": {"user": {"id": "42cfe5a9-7767-49e5-9082-b77b857b5508", "displayName": "matt", "username": "matt", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/profile_image_0ba7ae62-9719-47ea-9263-a07b296f645e.jpeg"}, "wallet": {"address": "0x9079a0a7e0eBEe7650C8c9Da2b6946e5a5B07C19"}}}, {"count": 1, "holder": {"user": {"id": "300e5f4a-f711-42ec-884a-32f632cb3bb4", "displayName": "tinyrainboot \ud83d\udd2e", "username": "tinyrainboot", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/profile_image_dde5c425-666f-4699-b5e5-6d84eec4dd26.jpeg"}, "wallet": {"address": "0x1216083Be36842278fb3cf9c3F56B7792eCc359b"}}}], "page": 0, "totalItems": 6, "totalPages": 1}, "firstMinter": {"user": {"id": "010fa13e-0451-4142-a5ce-69062d0c7a8b", "displayName": "Anna", "username": "artmonochrome", "imageUrl": "https://f8n-production.s3.us-east-2.amazonaws.com/rodeo/profiles/u9rtcd8ld.jpeg"}, "wallet": {"address": "0x207412225ed2B71f06d339179F888dE4AD1A7DbE"}}}}}
  const data = response.data.data;
  if (!data || !data.token) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
  }

  return {
    chainId: data.token.chainId,
    contractAddress: data.token.contractAddress,
    image: data.token.media.url,
    name: data.token.name,
    mintAddress: '0x132363a3bbf47E06CF642dd18E9173E364546C99',
    priceInWei: data.token.saleConfiguration.mintPrice,
    description: data.token.description,
    public_sale_start_at: data.token.saleConfiguration.startTime,
    public_sale_end_at: data.token.saleConfiguration.endTime,
    token_id: data.token.tokenId,
    sale_terms_id: data.token.saleConfiguration.saleTermsId as number,
    user: {
      name: data.token.creator.user.displayName,
      image: data.token.creator.user.imageUrl,
      address: data.token.creator.wallet.address,
    },
  };
};

export const rodeoSupports = async (
  contract: MintContractOptions,
  resources: MintIngestorResources,
): Promise<boolean> => {
  const { chainId, contractAddress, tokenId } = contract;
  const exists = await getRodeoMintByAddressAndChain(resources, chainId, contractAddress, tokenId);
  return !!exists;
};
