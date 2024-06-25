import axios from "axios";
import { MintContractOptions, MintIngestorResources } from "src/lib";

export const getFxhashMintByContract = async (resources: MintIngestorResources, contract: MintContractOptions): Promise<any> => {
    const graphQLRes = await resources.fetcher({
      url: 'https://api.v2-temp.fxhash.xyz/graphql',
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.fxhash.xyz/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
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

    const graphQLRes = await resources.fetcher({
      url: 'https://api.v2-temp.fxhash.xyz/graphql',
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.fxhash.xyz/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      data: {
        query: `
            query GenerativeToken($filters: SearchFilters!) {
              search(filters: $filters) {
                generativeTokens {
                  slug
                  id
                  chain
                  isFrame
                  name
                  metadata
                  mintOpensAt
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
}