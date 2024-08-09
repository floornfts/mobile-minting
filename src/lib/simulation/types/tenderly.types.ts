export enum TenderlyTokenStandard {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC777 = 'ERC777',
  ERC1155 = 'ERC1155',
  NATIVE = 'NativeCurrency',
}

export enum TenderlyTokenType {
  FUNGIBLE = 'Fungible',
  NON_FUNGIBLE = 'Non-Fungible',
}

export type TenderlyTokenInfo = {
  standard: TenderlyTokenStandard;
  contract_address: string;
  type?: TenderlyTokenType;
  symbol?: string;
  name?: string;
  logo?: string;
  decimals?: number;
  dollar_value?: string;
};

export type TenderlyLog = {
  name: string;
  anonymous: boolean;
  inputs: any[];
  trace_index: number | null;
  raw: {
    address: string;
    data: string;
    topics: string[];
  };
};

export type TenderlyAssetChange = {
  token_info: TenderlyTokenInfo;
  type: string;
  from: string;
  to: string;
  amount: string | null;
  raw_amount: string;
  dollar_value: string | null;
  token_id?: string;
};

export type TenderlyBalanceChange = {
  address: string;
  dollar_value: string;
  transfers: number[];
};

export type TenderlyCallTrace = {
  address: string;
  call_type: string;
  from: string;
  fromBalance: string;
  gas_used: number;
  gas: number;
  input: string;
  subtraces: number;
  to: string;
  value: string;
};

export type TenderlyTransactionInfo = {
  asset_changes: TenderlyAssetChange[];
  balance_changes: TenderlyBalanceChange[];
  balance_diff: any;
  block_number: number;
  call_trace: TenderlyCallTrace[];
  console_logs: any;
  contract_address: string;
  contract_id: string;
  created_at: string;
  intrinsic_gas: number;
  logs: TenderlyLog[];
  method: any;
  nonce_diff: any[];
  parameters: any;
  raw_state_diff: any;
  refund_gas: number;
  stack_trace: any[];
  state_diff: any;
  transactiion_id: string;
};

export type TenderlyErrorInfo = {
  error_message: string;
  address: string;
};

export type TenderlySimulatedTransaction = {
  hash: string;
  block_hash: string;
  block_number: number;
  from: string;
  gas: number;
  gas_price: number;
  gas_fee_cap: number;
  gas_tip_cap: number;
  cumulative_gas_used: number;
  gas_used: number;
  input: string;
  nonce: number;
  to: string;
  index: number;
  value: string;
  access_list: any[];
  status: boolean;
  addresses: any;
  contract_ids: any[];
  network_id: string;
  timestamp: string;
  function_selector: string;
  l1_block_number: number;
  l1_timestamp: number;
  deposit_tx: boolean;
  system_tx: boolean;
  sig: {
    v: string;
    r: string;
    s: string;
  };
  transaction_info: TenderlyTransactionInfo;
  error_message: string;
  error_info: TenderlyErrorInfo;
  method: string;
  decoded_input: any;
  call_trace: TenderlyCallTrace[];
};

export type TenderlyError = {
  id: string;
  slug: string;
  message: string;
};

export type TenderlySimulationResponse = {
  contracts?: any[];
  generated_access_list?: any[];
  simulation?: any;
  transaction?: TenderlySimulatedTransaction;
  error?: TenderlyError;
  error_message?: string;
};

export enum TenderlySimulationType {
  FULL = 'full',
  QUICK = 'quick',
  ABI = 'abi',
}

export type TenderlySimulationRequest = {
  access_list?: any[];
  amount_to_mint?: number;
  block_header?: any;
  block_number?: number;
  deposit_tx?: boolean;
  from: string;
  estimate_gas?: boolean;
  gas_price?: string;
  gas?: number;
  generate_access_list?: boolean;
  input: string;
  l1_block_number?: number;
  l1_timestamp?: number;
  li_message_sender?: string;
  mint?: number;
  network_id: string;
  save_if_fails?: boolean;
  save?: boolean;
  simulation_type?: TenderlySimulationType;
  state_objects?: any;
  system_tx?: boolean;
  to: string;
  transaction_index?: number;
  value?: string;
};

export type TenderlySimulationBatchRequest = {
  simulations: TenderlySimulationRequest[];
};

export type TenderlySimulationBatchResponse = {
  simulation_results: TenderlySimulationResponse[];
};
