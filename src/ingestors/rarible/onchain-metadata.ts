import { Alchemy, Contract } from 'alchemy-sdk';
import { RARIBLE_ABI } from './abi';

interface Tokendata {
    name: string;
    description: string;
    imageURI: string;
    animationURI: string;
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
    return  new Contract(contractAddress, RARIBLE_ABI, ethersProvider);
};

export const getRaribleContractMetadata = async (
    chainId: number,
    contractAddress: string,
    alchemy: Alchemy
): Promise<Tokendata> => {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const metadata = await contract.functions.sharedMetadata();
    const ownerAddress = await contract.functions.owner();
    const claimConditionParams = await contract.functions.claimCondition();

    const activeClaimId =
        claimConditionParams[0] > 0
            ? parseInt(claimConditionParams[0]) + parseInt(claimConditionParams[1]) - 1
            : 0;

    const claimCondition = await contract.functions.getClaimConditionById(activeClaimId);
    const claimCondition2 = await contract.functions.getClaimConditionById(1);

    return {
        name: metadata[0],
        description: metadata[1],
        imageURI: metadata[2],
        animationURI: metadata[3],
        unitMintPrice: parseInt(claimCondition[0][5]),
        unitPerWallet: parseInt(claimCondition[0][3]),
        unitMintTokenAddress: claimCondition[0][6], 
        conditionProof: claimCondition[0][4],
        ownerAddress: ownerAddress,
        startDate: new Date(parseInt(claimCondition[0][0]) * 1000),
        stopDate: new Date(parseInt(claimCondition2[0][0]) * 1000),
    };
};

export const getRaribleMintPriceInEth = async (
    unitMintPrice: number,
    unitMintTokenAddress: string,
  ): Promise<any> => {
    const apiKey = process.env.OX_API_KEY;
    if (!apiKey) {
        throw new Error('OX_API_KEY is not defined in the environment variables');
    }
    
    const url = `https://base.api.0x.org/swap/v1/price?sellToken=${unitMintTokenAddress}&buyToken=${'0x4200000000000000000000000000000000000006'}&sellAmount=${unitMintPrice}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json', 
            '0x-api-key': apiKey
        }
    });
    const jsonData = await response.json();

    return (parseFloat(jsonData.price) * 10 ** 18).toString()
  };

  