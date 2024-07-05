export const urlForValidRaribleCollection = async (
    chainId: number,
    contractAddress: string,
): Promise<string | undefined> => {
    const apiKey = process.env.RARIBLE_API_KEY;
    if (!apiKey) {
        throw new Error('RARIBLE_API_KEY is not defined in the environment variables');
    }
    const chain = chainId === 8453 ? 'BASE' : undefined;
    if (!chain) {
        return undefined;
    }

    const url = `https://api.rarible.org/v0.1/collections/${chain}%3A${contractAddress}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json', 
                'X-API-KEY': apiKey
            }
        })
        if (response.status !== 200) {
            return undefined;
        }
        return url;
    } catch (error) {
        console.error('Error fetching the Rarible page:', error); // Optional: Log the error for debugging
        return undefined;
    }
};

export const raribleOnchainDataFromUrl = async (
    url: string,
): Promise<{ chainId: number | undefined, contractAddress: string | undefined }> => {
    const urlParts = url.split('/');
    const chainId = urlParts[4] === 'base' ? 8453 : undefined;
    const contractAddress = urlParts[5];

    if (!chainId || !contractAddress || !contractAddress.startsWith('0x')) {
        return { chainId: undefined, contractAddress: undefined };
    }

    return { chainId, contractAddress };
};