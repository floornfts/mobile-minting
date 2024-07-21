import { Alchemy, BigNumber, Network, Utils } from "alchemy-sdk";
import { EVMMintInstructions } from "../types";
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
    11155111: Network.ETH_SEPOLIA
};

export const simulateEVMTransactionWithAlchemy = async (mintInstructions: EVMMintInstructions, blockNumber?: string): Promise<{ message: string, success: boolean, rawSimulationResult: any }> => {
    const alchemy = new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: NETWORKS[mintInstructions.chainId],
    });

    const abi = mintInstructions.abi;
    const iface = new Utils.Interface(abi);

    const paramsArray = prepareContractParams(mintInstructions.contractParams);

    const data = iface.encodeFunctionData(mintInstructions.contractMethod, paramsArray);

    const tx = {
        to: mintInstructions.contractAddress,
        from: SIGNER1_WALLET,
        data: data,
        value: BigNumber.from(mintInstructions.priceWei || '0').toHexString().replace('0x0', '0x'),
    };

    const simResult = await alchemy.transact.simulateExecution(tx, blockNumber ? blockNumber : undefined);

    const failedCalls: any = simResult.calls.find((call) => call.error) || [];

    const message = failedCalls?.revertReason;
    const success = failedCalls.length === 0;

    if (!success) {
        console.log(`Error Simulating: ${message}, ${JSON.stringify(simResult)}`);
    }

    return { message, success, rawSimulationResult: simResult };
}

export const prepareContractParams = (template: string): any[] => {
    const regex = /{{(\w+)}}|tokenId|address|encodedAddress/g;
  
    const replacedTemplate = template.replace(regex, (match) => {
      switch (match) {
        case 'address':
          return `"${TEST_RECIPIENT}"`;
        case 'encodedAddress':
          return `"${encodeAddress(TEST_RECIPIENT)}"`;
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
  