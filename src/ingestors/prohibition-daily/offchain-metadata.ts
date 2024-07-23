import { Axios } from "axios";

export const urlForValidProhibitionPage = async (chainId: number, contractAddress: string, fetcher: Axios): Promise<string | undefined> => {
    const url = `https://daily.prohibition.art/mint/${chainId}/${contractAddress}`;
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

export const prohibitionOnchainDataFromUrl = async (url: string): Promise<{ chainId: number | undefined, contractAddress: string | undefined }> => {
    // https://daily.prohibition.art/mint/8453/0x20479b19ca05e0b63875a65acf24d81cd0973331
    const urlParts = url.split('/');
    const contractAddress = urlParts.pop();
    const chainId = parseInt(urlParts.pop() || '');

    if (!chainId || Number.isNaN(chainId) || !contractAddress || !contractAddress.startsWith('0x')){
        return { chainId: undefined, contractAddress: undefined };
    }
    return { chainId, contractAddress };
};