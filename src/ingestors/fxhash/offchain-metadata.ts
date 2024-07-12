import axios from "axios";
import { MintContractOptions, MintIngestorResources } from "src/lib";

export const getFxhashMintByContract = async (resources: MintIngestorResources, contract: MintContractOptions): Promise<any> => {
    const graphQLRes = await resources.fetcher({
      url: 'https://api.v2-temp.fxhash.xyz/graphql',
      method: 'POST',
      headers: fxHashGraphQlheaders,
      data: {
        query: `
            query GenerativeToken($generativeTokenId: String) {
              generativeToken(id: $generativeTokenId) {
                slug
                chain
                isFrame
                metadata
                name
                mintOpensAt
                openEditionsEndsAt
                reserves {
                  method
                  amount
                  data
                }
                pricingFixed {
                  opensAt
                  price
                }
                pricingDutchAuction {
                  opensAt
                  levels
                  decrementDuration
                  restingPrice
                }
                author {
                  account {
                    profile {
                      description
                      farcaster
                      instagram
                      picture
                      twitter
                      website
                    }
                    username
                    wallets {
                      address
                      flag
                      network
                    }
                    id
                  }
                }
              }
            }
          `,
        variables: {
          generativeTokenId: contract.contractAddress,
        },
      },
    });

    return graphQLRes.data.data.generativeToken;
}

export const getFxHashMintsBySlug = async (resources: MintIngestorResources, slug: string | undefined): Promise<any[]> => {
    if (!slug) {
        return [];
    }
    const slugParts = slug.split('-');
    const longestSlug = slugParts.reduce((acc, cur) => {
      if (cur.length > acc.length) {
        return cur;
      }
      return acc;
    }, '');

    try {
      const graphQLRes = await resources.fetcher({
        url: 'https://api.v2-temp.fxhash.xyz/graphql',
        method: 'POST',
        headers: fxHashGraphQlheaders,
        data: {
          query: `
          query GenerativeToken($filters: SearchFilters!) {
            search(filters: $filters) {
              generativeTokens {
                slug
                id
                chain
                name
                metadata
                mintOpensAt
                reserves {
                  method
                  amount
                  data
                }
                pricingFixed {
                  opensAt
                  price
                }
                pricingDutchAuction {
                  opensAt
                  levels
                  decrementDuration
                  restingPrice
                }
                openEditionsEndsAt
              }
            }
          }
            `,
          variables: {
            filters: {
              searchQuery_eq: longestSlug,
            },
          },
        },
      });

      return graphQLRes.data.data.search.generativeTokens;
    } catch (error) {
      return [];
    }
}


const fxHashGraphQlheaders = {
  accept: '*/*',
  'authority': 'api.fxhash.xyz',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  priority: 'u=1, i',
  'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  Referer: 'https://studio.apollographql.com/sandbox/explorer',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Origin': 'https://studio.apollographql.com',

};

enum FxHashPricingType {
  FIXED = 'FIXED',
  DUTCH_AUCTION = 'DUTCH_AUCTION',
  FRAME = 'FRAME',
}
export function fxHashGetPricingFromParams(
  generativeToken: any
) {
  if (!generativeToken) {
    throw new Error("generativeToken is null or undefined")
  }
  const { pricingFixed, pricingDutchAuction, reserves, isFrame } = generativeToken;
  var price = 0;
  let type: FxHashPricingType | undefined = isFrame ? FxHashPricingType.FRAME : undefined;
  if (pricingFixed) {
    type = type || FxHashPricingType.FIXED;
    price = pricingFixed.price;
  }
  if (pricingDutchAuction) {
    type = FxHashPricingType.DUTCH_AUCTION;
    price = pricingDutchAuction.restingPrice;
  }

  return { priceWei: price, type: type }
}

const BASE_FRAME_CONTRACT_ADDRESS = '0x6e625892C739bFD960671Db5544E260757480725';
const BASE_FIXED_PRICE_CONTRACT_ADDRESS = '0x4bDcaC532143d8d35ed759189EE22E3704580b9D';
const BASE_DUTCH_AUCTION_CONTRACT_ADDRESS = '0x9667a1Cf26223c9de22207DD93cfEEc9237b8f4E';

export function fxHashContractForPricingType(mintType: FxHashPricingType, chain: string) {
  if (mintType === FxHashPricingType.FRAME) {
    return BASE_FRAME_CONTRACT_ADDRESS;
  }
  if (mintType === FxHashPricingType.FIXED) {
    return BASE_FIXED_PRICE_CONTRACT_ADDRESS;
  }
  if (mintType === FxHashPricingType.DUTCH_AUCTION) {
    return BASE_DUTCH_AUCTION_CONTRACT_ADDRESS; 
  }
  throw new Error(`Unknown mint type: ${mintType}`);
}