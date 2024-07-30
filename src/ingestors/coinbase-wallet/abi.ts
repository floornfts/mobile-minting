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
];
