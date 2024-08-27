import { Alchemy, Contract } from "alchemy-sdk";
import { RARIBLE_ABI } from "./abi";

interface ProfileData {
    pName: string;
    pImageUrl: string;
    pDescription: string;
    pWebsiteUrl: string; 
}

export const raribleCreatorProfileDataGetter = async (
    ownerAddress: string
): Promise<ProfileData> => {
    const START_IDX = 0;
    const endpoint = "https://rarible.com/marketplace/api/v4/profiles/list";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
            "Accept": "*/*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify([ownerAddress])
    });

    if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status} and text: ${response.statusText}.`);
    }

    const profileData = await response.json();
    const pImageUrl = profileData[START_IDX].imageMedia.length === 0 ? "" : profileData[START_IDX].imageMedia[START_IDX].url;

    return {
        pName: profileData[START_IDX].name,
        pImageUrl,
        pDescription: profileData[START_IDX].description,
        pWebsiteUrl: `https://rarible.com/${profileData[START_IDX].shortUrl}`,
    };
};

export const raribleOnchainDataFromUrl = async (
    url: string
): Promise<{ chainId: number | undefined, contractAddress: string | undefined }> => {
    const CHAIN_IDX = 4;
    const CONTRACT_ADDRESS_IDX = 5;
    const urlParts = url.split("/");
    const chainId = urlParts[CHAIN_IDX] === "base" ? 8453 : undefined;

    if (!chainId || !urlParts[CONTRACT_ADDRESS_IDX] || !urlParts[CONTRACT_ADDRESS_IDX].startsWith("0x")) {
        return { chainId: undefined, contractAddress: undefined };
    }

    return { chainId, contractAddress: urlParts[CONTRACT_ADDRESS_IDX] };
};

export const raribleUrlForValidCollection = async (
    chainId: number,
    contractAddress: string
): Promise<string | undefined> => {
    const apiKey = process.env.RARIBLE_API_KEY;
    if (!apiKey) {
        throw new Error("RARIBLE_API_KEY is not defined in the environment variables");
    }

    const chain = chainId === 8453 ? "BASE" : undefined;
    if (!chain) {
        throw new Error(`CHAIN ID is not valid: ${chainId}`);
    }

    const endpoint = `https://api.rarible.org/v0.1/collections/${chain}%3A${contractAddress}`;

    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            "Accept": "application/json", 
            "X-API-KEY": apiKey
        }
    });

    if (response.status === 200) {
        return `https://rarible.com/collection/${chain.toLowerCase()}/${contractAddress}/drops`;
    }
    if (response.status === 404) {
        return "";
    }

    throw new Error(`Request failed with status code ${response.status} and text: ${response.statusText}.`);
};

export const raribleUrlForValidBaseEthCollection = async (
    chainId: number,
    contractAddress: string,
    alchemy: Alchemy
): Promise<string | undefined> => {
    const START_IDX = 0;
    const CONTRACT_ADDRESS_IDX = 5;
    const TOKEN_ADDR_IDX = 6;
    const ETH_MINT = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

    const collectionUrl = await raribleUrlForValidCollection(chainId, contractAddress);
    if (!collectionUrl) {
        return "";
    }

    const urlParts = collectionUrl.split("/");
    if (!urlParts) {
        throw new Error("urlForValidRaribleBaseEthCollection: undefined urlParts of the collection url.");
    }

    const collectionAddress = urlParts[CONTRACT_ADDRESS_IDX];
    const ethersProvider = await alchemy.config.getProvider();
    const contract = new Contract(collectionAddress, RARIBLE_ABI, ethersProvider);
    const activeClaimId = await contract.functions.getActiveClaimConditionId();
    const claimCondition = await contract.functions.getClaimConditionById(parseInt(activeClaimId));
    const mintTokenAddress = claimCondition[START_IDX][TOKEN_ADDR_IDX];

    if (mintTokenAddress === ETH_MINT) {
        return collectionUrl;
    }

    throw new Error("urlForValidRaribleBaseEthCollection: Not a Base Eth mint");
};

