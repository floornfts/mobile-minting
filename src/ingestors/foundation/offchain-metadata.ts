import { MintContractOptions, MintIngestorResources } from 'src/lib';
import { Collection } from './types';

export const getFoundationMintByAddress = async (
  resources: MintIngestorResources,
  contract: MintContractOptions,
): Promise<Collection | undefined> => {
  try {
    const resp = await resources.fetcher.post(
      'https://api-v2.foundation.app/graphql',
      {
        query: `
    query MintPage($collection: CollectionInput!) {
      collection(by: {collection: $collection}, moderationFilter: ALL) {
        __typename
        ... on StandardCollection {
          slug
        }
        ... on DropCollection {
          ...DropFragment
          totalVolumeInEth
        }
        ... on EditionCollection {
          ...EditionFragment
          lastMintedAt
          totalVolumeInEth
          assetUrl
          media {
            ...MediaFragment
          }
        }
      }
    }

    fragment DropFragment on DropCollection {
      chainId
      collectionImageUrl
      contractAddress
      contractType
      coverImageUrl
      creator {
        ...UserLightFragment
      }
      description
      earlyAccessStartTime
      endTime
      generalAvailabilityStartTime
      isRevealed
      media {
        ...MediaFragment
      }
      mintPrice
      name
      nftCount
      saleType
      slug
      status: availabilityStatus
      symbol
    }

    fragment UserLightFragment on UserLightInterface {
      name
      profileImageUrl
      publicKey: accountAddress
      username
    }

    fragment MediaFragment on Media {
      __typename
      ... on ImageMedia {
        processingStatus
        sourceUrl
        url
        imageMimeType: mimeType
      }
      ... on VideoMedia {
        previewUrl
        processingStatus
        sourceUrl
        staticUrl
        url
        videoMimeType: mimeType
      }
      ... on ModelMedia {
        processingStatus
        sourceUrl
        url
        modelMimeType: mimeType
        modelStaticUrl: staticUrl
      }
    }

    fragment EditionFragment on EditionCollection {
      chainId
      id
      name
      slug
      symbol
      nftCount
      description
      contractAddress
      assetUrl
      mimeType
      moderationStatus
      moderationFrom
      tokenUri
      contractType
      worldId
      creator {
        ...UserLightFragment
      }
      editionSale: saleConfiguration {
        ...EditionSaleConfigurationFragment
      }
    }
    fragment EditionSaleConfigurationFragment on EditionSaleConfiguration {
      __typename
      ... on TimedEditionSaleConfiguration {
        endTime
        mintPrice
        startTime
        timedEditionStatus: status
      }
      ... on LimitedEditionSaleConfiguration {
        maxTokenId
        mintPrice
        startTime
        limitedEditionStatus: status
      }
    }
  `,
        variables: {
          collection: {
            chainId: contract.chainId,
            contractAddress: contract.contractAddress,
          },
        },
      },
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7,ro-RO;q=0.6,ro;q=0.5',
          'content-type': 'application/json',
          'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          Referer: 'https://foundation.app/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
    );
    return resp.data.data.collection;
  } catch (error: any) {
    console.log(error);
    return;
  }
};
