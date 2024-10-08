import { Contract } from 'alchemy-sdk';
import { RARIBLE_ABI } from './abi';
import { AlchemyMultichainClient } from '../../../src/lib/rpc/alchemy-multichain';
import { NETWORKS } from '../../../src/lib/simulation/simulation';

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

enum ContractURIIndex {
  CID = 2,
}

enum ClaimConditionIndex {
  StartTimestamp = 0,
  MaxClaimableSupply = 1,
  ConditionProof = 4,
  MintPrice = 5,
  TokenAddress = 6,
}

class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

class ContractInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractInteractionError';
  }
}

const getContract = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<Contract> => {
  try {
    const ethersProvider = await alchemy.forNetwork(NETWORKS[chainId]).config.getProvider();
    return new Contract(contractAddress, RARIBLE_ABI, ethersProvider);
  } catch (error: unknown) {
    let errorMessage = 'Failed to initialize contract';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    } else {
      errorMessage += ': Unknown error occurred';
    }
    throw new ContractInteractionError(errorMessage);
  }
};
const fetchIPFSMetadata = async (cid: string): Promise<any> => {
  const response = await fetch(`https://ipfs.io/ipfs/${cid}/0`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`IPFS request failed with status code ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const getClaimCondition = async (contract: Contract, claimId: number): Promise<any> => {
  try {
    return await contract.functions.getClaimConditionById(claimId);
  } catch (error: unknown) {
    let errorMessage = 'Failed to get claim condition';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    } else {
      errorMessage += ': Unknown error occurred';
    }
    throw new ContractInteractionError(errorMessage);
  }
};

const processClaimCondition = (
  claimCondition: any,
): {
  mintTokenAddress: string;
  mintPrice: number;
  unitPerWallet: number;
  conditionProof: string;
  mintTimestamp: Date;
} => {
  const [condition] = claimCondition;
  return {
    mintTokenAddress: condition[ClaimConditionIndex.TokenAddress],
    mintPrice: parseInt(condition[ClaimConditionIndex.MintPrice]),
    unitPerWallet: parseInt(condition[ClaimConditionIndex.ConditionProof]),
    conditionProof: condition[ClaimConditionIndex.ConditionProof],
    mintTimestamp: new Date(parseInt(condition[ClaimConditionIndex.StartTimestamp]) * 1000),
  };
};

export const raribleContractMetadataGetter = async (
  chainId: number,
  contractAddress: string,
  alchemy: AlchemyMultichainClient,
): Promise<Tokendata> => {
  if (!chainId || !contractAddress || !alchemy) {
    throw new InvalidInputError('Invalid input: chainId, contractAddress, and alchemy are required');
  }

  try {
    const contract = await getContract(chainId, contractAddress, alchemy);
    const [contractURI] = await contract.functions.contractURI();
    const cid = contractURI.split('/')[ContractURIIndex.CID];

    const [metadataJSON, [ownerAddress], activeClaimId] = await Promise.all([
      fetchIPFSMetadata(cid),
      contract.functions.owner(),
      contract.functions.getActiveClaimConditionId(),
    ]);

    const activeClaimCondition = await getClaimCondition(contract, parseInt(activeClaimId));
    const maxClaimableSupply = BigInt(activeClaimCondition[0][ClaimConditionIndex.MaxClaimableSupply]._hex).valueOf();

    let startCondition, stopCondition;
    if (maxClaimableSupply > BigInt(0).valueOf()) {
      startCondition = processClaimCondition(activeClaimCondition);
      stopCondition = processClaimCondition(await getClaimCondition(contract, parseInt(activeClaimId) + 1));
    } else {
      stopCondition = processClaimCondition(activeClaimCondition);
      startCondition = processClaimCondition(await getClaimCondition(contract, parseInt(activeClaimId) - 1));
    }

    return {
      name: metadataJSON.name,
      description: metadataJSON.description,
      imageURI: metadataJSON.image,
      unitMintPrice: startCondition.mintPrice,
      unitPerWallet: startCondition.unitPerWallet,
      unitMintTokenAddress: startCondition.mintTokenAddress,
      conditionProof: startCondition.conditionProof,
      ownerAddress: ownerAddress,
      startDate: startCondition.mintTimestamp,
      stopDate: stopCondition.mintTimestamp,
    };
  } catch (error: unknown) {
    let errorMessage = 'Failed to get contract metadata';
    if (error instanceof InvalidInputError || error instanceof ContractInteractionError) {
      throw error;
    }
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    } else {
      errorMessage += ': Unknown error occurred';
    }
    throw new ContractInteractionError(errorMessage);
  }
};
