export const OPENSEA_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getPublicDrop',
    outputs: [
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct PublicDrop',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
      { internalType: 'address', name: 'minterIfNotPayer', type: 'address' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
    ],
    name: 'mintPublic',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];
