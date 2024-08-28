import { Alchemy, BigNumber, Network, Utils } from 'alchemy-sdk';
import { EVMMintInstructions } from '../types';
import Tenderly from './tenderly';
export const SIGNER1_WALLET = '0x965EF172b303B0BcdC38669DF1De3c26BAD2dB8a';
export const TEST_RECIPIENT = '0x0cc9601298361e844451a7e35e1d7fcd72750e47';

export const NETWORKS: Record<number, Network> = {
  1: Network.ETH_MAINNET,
  5: Network.ETH_GOERLI,
  137: Network.MATIC_MAINNET,
  42161: Network.ARB_MAINNET,
  80001: Network.MATIC_MUMBAI,
  8453: Network.BASE_MAINNET,
  84531: Network.BASE_GOERLI,
  11155111: Network.ETH_SEPOLIA,
};

export const simulateEVMTransactionWithAlchemy = async (
  mintInstructions: EVMMintInstructions,
  quantity: number,
  blockNumber?: string,
): Promise<{ message: string; success: boolean; rawSimulationResult: any }> => {
  const amount = mintInstructions.supportsQuantity
    ? (BigInt(quantity) * BigInt(mintInstructions.mintFeePerTokenWei)).toString()
    : mintInstructions.mintFeePerTokenWei || mintInstructions.priceWei || '0';
  const network = NETWORKS[mintInstructions.chainId];
  if (!network) {
    console.log(`Unsupported chainId: ${mintInstructions.chainId}. Defaulting to success for now.`);
    return { message: `Unsupported chainId: ${mintInstructions.chainId}`, success: true, rawSimulationResult: {} };
  }
  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: network,
  });

  const data = dataForMintInstructions(mintInstructions, quantity);
  const tx = {
    to: mintInstructions.contractAddress,
    from: SIGNER1_WALLET,
    data: data,
    value: BigNumber.from(amount).toHexString().replace('0x0', '0x'),
  };

  const simResult = await alchemy.transact.simulateExecution(tx, blockNumber ? blockNumber : undefined);

  const failedCalls: any = simResult.calls.find((call) => call.error) || [];

  const message = failedCalls?.revertReason;
  const success = failedCalls.length === 0;

  if (!success) {
    console.log(`Error Simulating: ${message}, ${JSON.stringify(simResult)}`);
  }

  return { message, success, rawSimulationResult: simResult };
};

export const simulateEVMTransaction = async (
  mintInstructions: EVMMintInstructions,
  quantity: number,
  blockNumber?: string,
): Promise<{ message: string; success: boolean; rawSimulationResult: any }> => {
  const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY;
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

  if (TENDERLY_ACCESS_KEY) {
    console.log('Simulating with Tenderly');
    return simulateEVMTransactionWithTenderly(mintInstructions, quantity, blockNumber);
  } else if (ALCHEMY_API_KEY) {
    console.log('Simulating with Alchemy');
    return simulateEVMTransactionWithAlchemy(mintInstructions, quantity, blockNumber);
  } else {
    throw new Error('No API key found');
  }
};

export const simulateEVMTransactionWithTenderly = async (
  mintInstructions: EVMMintInstructions,
  quantity: number,
  blockNumber?: string,
): Promise<{ message: string; success: boolean; rawSimulationResult: any }> => {
  const tenderly = new Tenderly();
  const amount = mintInstructions.supportsQuantity
    ? (BigInt(quantity) * BigInt(mintInstructions.mintFeePerTokenWei)).toString()
    : mintInstructions.mintFeePerTokenWei || mintInstructions.priceWei || '0';

  const tx = {
    to: mintInstructions.contractAddress,
    from: SIGNER1_WALLET,
    data: dataForMintInstructions(mintInstructions, quantity),
    value: BigNumber.from(amount || '0')
      .toHexString()
      .replace('0x0', '0x'),
    chainId: mintInstructions.chainId,
  };

  const simResult = await tenderly.simulateTransaction(tx, blockNumber ? blockNumber : undefined);

  return {
    message: simResult.simulation.error_message ?? 'ok',
    success: !simResult.simulation.error_message,
    rawSimulationResult: simResult,
  };
};

const dataForMintInstructions = (mintInstructions: EVMMintInstructions, quantity: number) => {
  const abi = mintInstructions.abi;
  const iface = new Utils.Interface(abi);

  const paramsArray = prepareContractParams(mintInstructions, quantity);
  console.log(`Params: ${JSON.stringify(paramsArray)}`);
  const data = iface.encodeFunctionData(mintInstructions.contractMethod, paramsArray);

  return data;
};

export const prepareContractParams = (mintInstructions: EVMMintInstructions, quantity: number): any[] => {
  const regex = /{{(\w+)}}|tokenId|address|encodedAddress|quantity/g;

  const replacedTemplate = mintInstructions.contractParams.replace(regex, (match) => {
    switch (match) {
      case 'address':
        return `"${TEST_RECIPIENT}"`;
      case 'encodedAddress':
        return `"${encodeAddress(TEST_RECIPIENT)}"`;
      case 'tokenId':
        return `"${mintInstructions.tokenId || '1'}"`;
      case 'quantity':
        return `${quantity}`;
      default:
        return '""';
    }
  });
  return JSON.parse(replacedTemplate);
};

export const encodeAddress = (address: string) => {
  const rawAddress = address.replace('0x', '');

  return '0x' + rawAddress.padStart(64, '0');
};
