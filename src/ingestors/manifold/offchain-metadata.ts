import { Axios } from "axios";
import { start } from "repl";

export const manifoldOnchainDataFromUrl = async (
    url: any,
    fetcher: Axios
  ): Promise<any> => {
    const slug = url.match(/\/c\/([^\/]+)/)?.[1];
    if (!slug) return false;
  
    try {
      const { data } = await fetcher.get(`https://apps.api.manifoldxyz.dev/public/instance/data?appId=2522713783&instanceSlug=${slug}`);
      const { id, creator, publicData } = data || {};
      const { asset, network: chainId, contract, mintPrice, startDate, endDate } = publicData || {};
      const { name, description, image_url: imageUrl } = asset || {};
      const { contractAddress } = contract || {};
      
      if (!creator?.name || !creator?.address || !name || !description || !imageUrl || !chainId || !contractAddress || !mintPrice?.value ) {
        return false;
      }
      
      let startTime = new Date(startDate);
      let endTime = new Date(endDate);

      if (!startDate){
        startTime = new Date();
      }

      if (!endDate){
        endTime = new Date('2030-01-01')
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
      };
    } catch {
      return false;
    }
  };