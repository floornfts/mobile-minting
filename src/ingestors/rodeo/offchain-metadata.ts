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
  description: string;
  tokenId: string;
}> => {
  const urlParts = new URL(url);
  const contractAddress = urlParts.pathname.split('/')[2];
  const tokenId = urlParts.pathname.split('/')[3];
  if (!contractAddress || contractAddress.length !== 42) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Mint not found');
  }
  if (!tokenId || tokenId.length === 0) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Token not found');
  }
  return await getRodeoMintByAddressAndChain(resources, 8453, contractAddress, tokenId);
};

export const getRodeoMintByAddressAndChain = async (
  resources: MintIngestorResources,
  chainId: number,
  contractAddress: string,
  tokenId: string,
) => {
  let response: AxiosResponse;
  try {
    const url = 'https://api.rodeo.club/graphql';

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
          tokenId: parseInt(tokenId),
        },
      },
      operationName: 'ShopPage',
    };

    response = await resources.fetcher.post(url, data, { headers });
  } catch (error) {
    throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Could not query mint from Transient API');
  }
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
    description: data.token.description,
    public_sale_start_at: data.token.saleConfiguration.startTime,
    public_sale_end_at: data.token.saleConfiguration.endTime,
    tokenId: data.token.tokenId,
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
  try {
    const exists = await getRodeoMintByAddressAndChain(resources, chainId, contractAddress, tokenId as string);
    return !!exists;
  } catch (error) {
    return false;
  }
};
