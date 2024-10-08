export const MINT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      { internalType: 'string', name: 'comment', type: 'string' },
    ],
    name: 'mintWithComment',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'metadata',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'string', name: 'image', type: 'string' },
      { internalType: 'string', name: 'animation_url', type: 'string' },
      { internalType: 'string', name: 'mintType', type: 'string' },
      { internalType: 'uint128', name: 'maxSupply', type: 'uint128' },
      { internalType: 'uint128', name: 'maxPerWallet', type: 'uint128' },
      { internalType: 'uint256', name: 'cost', type: 'uint256' },
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'quantity', type: 'uint256' }],
    name: 'cost',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
