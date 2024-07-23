import { Alchemy, Contract } from 'alchemy-sdk';
import { RARIBLE_ABI } from './abi';

interface Tokendata {
    name: string;
    description: string;
    imageURI: string;
    unitMintPrice: number;
    unitMintTokenAddress: string;
    unitPerWallet: number;
    conditionProof: string;
    ownerAddress: string;
    startDate: Date;
    stopDate: Date;
}

const getContract = async (chainId: number, contractAddress: string, alchemy: Alchemy): Promise<Contract> => {
    const ethersProvider = await alchemy.config.getProvider();
    return new Contract(contractAddress, RARIBLE_ABI, ethersProvider);
};

export const raribleContractMetadataGetter = async (
    chainId: number,
    contractAddress: string,
    alchemy: Alchemy
): Promise<Tokendata> => {
    const START_IDX = 0;
    const START_TIMESTAMP_IDX = 0;
    const MAX_CLAIMABLE_SUPPLY_IDX = 1;
    const CID_IDX = 2;
    const COND_PROOF_IDX = 4;
    const MINT_PRICE_IDX = 5;
    const TOKEN_ADDR_IDX = 6;

    const contract = await getContract(chainId, contractAddress, alchemy);
    const contractURI = await contract.functions.contractURI();
    const cid = contractURI[START_IDX].split('/')[CID_IDX];

    const response = await fetch(`https://ipfs.io/ipfs/${cid}/0`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status} and text: ${response.statusText}.`);
    }

    const metadataJSON = await response.json();
    const ownerAddresses = await contract.functions.owner();
    const activeClaimId = await contract.functions.getActiveClaimConditionId();
    let claimCondition = await contract.functions.getClaimConditionById(parseInt(activeClaimId));
    
    const ownerAddress = ownerAddresses[START_IDX];
    const maxClaimableSupply = BigInt(claimCondition[START_IDX][MAX_CLAIMABLE_SUPPLY_IDX]._hex).valueOf();
    let mintTokenAddress: string;
    let mintPrice: number;
    let unitPerWallet: number;
    let conditionProof: string;
    let mintStartTimestamp: Date;
    let mintStopTimestamp: Date;

    if (maxClaimableSupply > BigInt(0).valueOf()) {
        mintTokenAddress = claimCondition[START_IDX][TOKEN_ADDR_IDX];
        mintPrice = parseInt(claimCondition[START_IDX][MINT_PRICE_IDX]);
        unitPerWallet = parseInt(claimCondition[START_IDX][COND_PROOF_IDX]);
        conditionProof = claimCondition[START_IDX][COND_PROOF_IDX];
        mintStartTimestamp = new Date(parseInt(claimCondition[START_IDX][START_TIMESTAMP_IDX]) * 1000);

        const nextClaimId = parseInt(activeClaimId) + 1;
        claimCondition = await contract.functions.getClaimConditionById(nextClaimId);
        mintStopTimestamp = new Date(parseInt(claimCondition[START_IDX][START_TIMESTAMP_IDX]) * 1000);
    } else {
        mintStopTimestamp = new Date(parseInt(claimCondition[START_IDX][START_TIMESTAMP_IDX]) * 1000);

        const prevClaimId = parseInt(activeClaimId) - 1;
        claimCondition = await contract.functions.getClaimConditionById(prevClaimId);
        mintTokenAddress = claimCondition[START_IDX][TOKEN_ADDR_IDX];
        mintPrice = parseInt(claimCondition[START_IDX][MINT_PRICE_IDX]);
        unitPerWallet = parseInt(claimCondition[START_IDX][COND_PROOF_IDX]);
        conditionProof = claimCondition[START_IDX][COND_PROOF_IDX];
        mintStartTimestamp = new Date(parseInt(claimCondition[START_IDX][START_TIMESTAMP_IDX]) * 1000);
    }

    return {
        name: metadataJSON.name,
        description: metadataJSON.description,
        imageURI: metadataJSON.image,
        unitMintPrice: mintPrice,
        unitPerWallet: unitPerWallet,
        unitMintTokenAddress: mintTokenAddress,
        conditionProof: conditionProof,
        ownerAddress: ownerAddress,
        startDate: mintStartTimestamp,
        stopDate: mintStopTimestamp,
    };
};
