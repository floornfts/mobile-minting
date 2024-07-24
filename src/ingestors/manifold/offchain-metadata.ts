import { Axios } from "axios";

export const manifoldOnchainDataFromUrl = async (
    url: any,
    fetcher: Axios
  ): Promise<any> => {
    const slug = url.match(/\/c\/([^\/]+)/)?.[1];
    if (!slug) return false;
  
    try {
      const { data } = await fetcher.get(`https://apps.api.manifoldxyz.dev/public/instance/data?appId=2522713783&instanceSlug=${slug}`);
      const { creator, publicData } = data || {};
      const { asset, network: chainId, contract, mintPrice, startDate, endDate } = publicData || {};
      const { name, description, image_url: imageUrl } = asset || {};
      const { contractAddress } = contract || {};
  
      // check if all required fields are present
      if (!creator?.name || !creator?.address || !name || !description || !imageUrl || !chainId || !contractAddress || !mintPrice?.value || !startDate) {
        return false;
      }
      
      const hostname = new URL(url).hostname;

      return { 
        creatorName: publicData.asset.created_by, 
        creatorAddress: creator.address, 
        name, 
        description, 
        websiteUrl: hostname,
        imageUrl, 
        chainId, 
        contractAddress,
        mintPrice: mintPrice.value,
        startDate: new Date (startDate),
        endDate
      };
    } catch {
      return false;
    }
  };