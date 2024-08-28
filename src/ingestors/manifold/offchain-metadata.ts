import { Axios } from 'axios';

const MANIFOLD_LAZY_PAYABLE_CLAIM_CONTRACT_1155 = '0x26BBEA7803DcAc346D5F5f135b57Cf2c752A02bE';
const MANIFOLD_LAZY_PAYABLE_CLAIM_CONTRACT_721 = '0x23aA05a271DEBFFAA3D75739aF5581f744b326E4';

export const manifoldOnchainDataFromUrl = async (url: any, fetcher: Axios): Promise<any> => {
  const slug = url.match(/\/c\/([^\/]+)/)?.[1];
  if (!slug) return false;

  try {
    const { data } = await fetcher.get(
      `https://apps.api.manifoldxyz.dev/public/instance/data?appId=2522713783&instanceSlug=${slug}`,
    );
    console.log('data', data);
    const { id, creator, publicData } = data || {};
    const {
      asset,
      network: chainId,
      contract,
      mintPrice,
      startDate,
      endDate,
      extensionAddress721,
      extensionAddress1155,
    } = publicData || {};
    const { name, description, image_url: imageUrl } = asset || {};
    var { contractAddress, spec } = contract || {};
    const creatorAddress = creator.address;
    var mintAddress;
    switch (spec) {
      case 'ERC721':
        mintAddress = extensionAddress721?.value || MANIFOLD_LAZY_PAYABLE_CLAIM_CONTRACT_721;
        break;
      case 'ERC1155':
        mintAddress = extensionAddress1155?.value || MANIFOLD_LAZY_PAYABLE_CLAIM_CONTRACT_1155;
        break;
      default:
        throw new Error('Invalid contract spec');
    }

    if (!creator?.name || !name || !imageUrl || !chainId || !contractAddress || !mintPrice?.value) {
      return false;
    }

    let startTime = new Date(startDate);
    let endTime = new Date(endDate);

    if (!startDate) {
      startTime = new Date();
    }

    if (!endDate) {
      endTime = new Date('2030-01-01');
    } else if (new Date(endDate) < new Date()) {
      return false;
    }

    return {
      instanceId: id,
      creatorName: publicData.asset.created_by,
      creatorAddress: creator.address,
      name,
      description,
      imageUrl,
      chainId,
      contractAddress,
      mintPrice: mintPrice.value,
      startDate: startTime,
      endDate: endTime,
      mintAddress,
    };
  } catch {
    return false;
  }
};
