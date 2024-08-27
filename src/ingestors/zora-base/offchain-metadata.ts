import { Axios } from "axios";
export const urlForValidZoraPage = async ( contractAddress: string,tokenId:string, fetcher: Axios): Promise<string | undefined> => {

    const url = `https://zora.co/collect/base:${contractAddress}/${tokenId}`;
    try {
        const response = await fetcher.get(url);
        if (response.status !== 200) {
            return undefined;
        }
        return url;
    } catch (error) {
        return undefined;
    }
};

export const fetchCreatorProfile=async(walletAddress:string,fetcher: Axios):Promise<any>=>{
    const url=`https://zora.co/api/profiles/${walletAddress}`;
    try {
        const response = await fetcher.get(url);
        if (response.status !== 200) {
             return undefined;
        }
        return response.data;
     } catch (error) {
          return undefined;
     }
}

export const zoraOnchainIdDataFromUrl = async (url: string, fetcher: Axios): Promise<{ tokenId: string | undefined, contractAddress: string | undefined,chainId: number | undefined }> => {
    //https://zora.co/collect/base:0x1e1ad3d381bc0ccea5e44c29fb1f7a0981b97f37/1

  let chainId;
    const chain= url.split('/')[4].split(':')[0];
    if(chain=='base'){
        chainId=8453
    }
    const contractAddress = url.split('/')[4].split(':')[1];
    const tokenId = (url.split('/')[5]);

    if (!tokenId || !contractAddress || !chainId) {
    return {chainId:undefined,tokenId: undefined, contractAddress: undefined};
    }

    return { chainId,tokenId, contractAddress };
};