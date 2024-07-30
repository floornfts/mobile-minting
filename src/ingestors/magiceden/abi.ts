export const MAGIC_EDEN_ABI = [
  {
    inputs: [
      { internalType: 'uint32', name: 'qty', type: 'uint32' },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
      { internalType: 'uint64', name: 'timestamp', type: 'uint64' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];
