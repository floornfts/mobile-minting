import { MintIngestor, MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintIngestionErrorName, MintIngestorError } from '../../lib/types/mint-ingestor-error';
import { MintInstructionType, MintTemplate } from '../../lib/types/mint-template';
import { MintTemplateBuilder } from '../../lib/builder/mint-template-builder';
import { FXHASH_BASE_FIXED_PRICE_ABI, FXHASH_BASE_FRAME_ABI } from './abi';
import { getFxHashMintPriceInEth } from './onchain-metadata';

const BASE_FRAME_CONTRACT_ADDRESS = '0x6e625892C739bFD960671Db5544E260757480725';
const BASE_FIXED_PRICE_CONTRACT_ADDRESS = '0x4bDcaC532143d8d35ed759189EE22E3704580b9D';

export class FxHashIngestor implements MintIngestor {
  async supportsUrl(url: string): Promise<boolean> {
    return new URL(url).hostname === 'www.fxhash.xyz' || new URL(url).hostname === 'fxhash.xyz';
  }

  async createMintTemplateForUrl(url: string, resources: MintIngestorResources): Promise<MintTemplate> {
    const isCompatible = await this.supportsUrl(url);
    if (!isCompatible) {
      throw new MintIngestorError(MintIngestionErrorName.IncompatibleUrl, 'Incompatible URL');
    }

    const mintBuilder = new MintTemplateBuilder()
      .setOriginalUrl(url)
      .setMintInstructionType(MintInstructionType.EVM_MINT)
      .setPartnerName('fxhash');

    // Example URL: https://www.fxhash.xyz/generative/slug/allegro
    // First get the slug from the end

    const slug = url.split('/').pop();

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
            searchQuery_eq: slug,
          },
        },
      },
    });

    // Make sure one has the exact slug we're looking for and is on BASE or ETHEREUM (not TEZOS)
    const token = (graphQLRes as any).data.data.search.generativeTokens.find(
      (t: any) => t.slug === slug && t.chain !== 'TEZOS',
    );

    if (!token) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Project not found');
    }

    // For newer / eth based collections, the id is the contract
    const dropAddress = token.id;
    const chainId = token.chain === 'BASE' ? 8453 : null;

    if (!chainId) {
      throw new MintIngestorError(MintIngestionErrorName.CouldNotResolveMint, 'Chain not supported');
    }

    const contractAddress = token.isFrame ? BASE_FRAME_CONTRACT_ADDRESS : BASE_FIXED_PRICE_CONTRACT_ADDRESS;
    const abi = token.isFrame ? FXHASH_BASE_FRAME_ABI : FXHASH_BASE_FIXED_PRICE_ABI;

    const description = token.metadata?.description || '';
    const image = token.metadata?.thumbnailUri || '';

    mintBuilder.setName(token.name).setDescription(description).setFeaturedImageUrl(image);

    // The 1 is reserveId in their contract... not clear what for... but it's always 1
    const totalPriceWei = await getFxHashMintPriceInEth(
      chainId,
      contractAddress,
      dropAddress,
      1,
      resources.alchemy,
      abi,
    );

    mintBuilder.setMintInstructions({
      chainId,
      contractAddress,
      contractMethod: 'buy',
      // Note - the "id" is really the contract address in their system
      contractParams: `["${token.id}", 1, 1, address]`,
      abi: abi,
      priceWei: totalPriceWei,
    });

    const liveDate = new Date() > token.mintOpensAt ? new Date() : new Date(token.mintOpensAt);
    mintBuilder
      .setAvailableForPurchaseEnd(new Date(token.openEditionsEndsAt || '2030-01-01'))
      .setAvailableForPurchaseStart(new Date(token.mintOpensAt || Date.now()))
      .setLiveDate(liveDate);

    const output = mintBuilder.build();
    return output;
  }
}
