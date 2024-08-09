import axios from 'axios';
import {
  TenderlySimulationBatchRequest,
  TenderlySimulationBatchResponse,
  TenderlySimulationRequest,
  TenderlySimulationResponse,
  TenderlySimulationType,
} from './types/tenderly.types';
import { TransactionRequest } from 'ethers';

const formatTransactionRequest = (tx: TransactionRequest, blockNumber?: string): TenderlySimulationRequest => {
  const blockNumberNumber = blockNumber ? parseInt(blockNumber.replace('0x', ''), 16) : undefined;
  const body = {
    network_id: tx.chainId?.toString() ?? '1',
    from: tx.from?.toString() ?? '',
    to: tx.to?.toString() ?? '',
    input: tx.data ?? '0x',
    value: tx.value?.toString(),
    simulation_type: TenderlySimulationType.QUICK,
    estimate_gas: false,
    block_number: blockNumberNumber,
  };
  return body;
};

class Tenderly {
  client() {
    const TENDERLY_ACCOUNT_SLUG = process.env.TENDERLY_ACCOUNT_SLUG;
    const TENDERLY_PROJECT_SLUG = process.env.TENDERLY_PROJECT_SLUG;
    const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY;

    return axios.create({
      baseURL: `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': TENDERLY_ACCESS_KEY,
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
  }

  async simulateTransaction(tx: TransactionRequest, blockNumber?: string): Promise<TenderlySimulationResponse> {
    const urlPath = '/simulate';
    const body: TenderlySimulationRequest = formatTransactionRequest(tx, blockNumber);

    const response = await this.client().post(urlPath, body);

    return response.data;
  }

  async simulateTransactionBatch(txs: TransactionRequest[]): Promise<TenderlySimulationBatchResponse> {
    const urlPath = '/simulate-bundle';
    const body: TenderlySimulationBatchRequest = {
      simulations: txs.map((tx) => formatTransactionRequest(tx)),
    };

    const response = await this.client().post(urlPath, body);

    return response.data;
  }
}

export default Tenderly;
