export const TRANSIENT_BASE_ABI = [
  {
    inputs: [],
    name: 'protocolFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftAddress', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'numberToMint', type: 'uint256' },
      { internalType: 'uint256', name: 'presaleNumberCanMint', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
    ],
    name: 'purchase',
    outputs: [{ internalType: 'uint256', name: 'refundAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
];

/**
 * This ABI also works for ERC721TL contracts
 */
export const TRANSIENT_ERC7160TL_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'nftAddress', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'numberToMint', type: 'uint256' },
      { internalType: 'uint256', name: 'presaleNumberCanMint', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
    ],
    name: 'purchase',
    outputs: [{ internalType: 'uint256', name: 'refundAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
];
