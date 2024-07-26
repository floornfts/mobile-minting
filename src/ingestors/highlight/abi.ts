export const MINT_CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'vectorId', type: 'uint256' }],
    name: 'getAbridgedVector',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'contractAddress', type: 'address' },
          { internalType: 'uint48', name: 'startTimestamp', type: 'uint48' },
          { internalType: 'uint48', name: 'endTimestamp', type: 'uint48' },
          { internalType: 'address', name: 'paymentRecipient', type: 'address' },
          { internalType: 'uint48', name: 'maxTotalClaimableViaVector', type: 'uint48' },
          { internalType: 'uint48', name: 'totalClaimedViaVector', type: 'uint48' },
          { internalType: 'address', name: 'currency', type: 'address' },
          { internalType: 'uint48', name: 'tokenLimitPerTx', type: 'uint48' },
          { internalType: 'uint48', name: 'maxUserClaimableViaVector', type: 'uint48' },
          { internalType: 'uint192', name: 'pricePerToken', type: 'uint192' },
          { internalType: 'uint48', name: 'editionId', type: 'uint48' },
          { internalType: 'bool', name: 'editionBasedCollection', type: 'bool' },
          { internalType: 'bool', name: 'requireDirectEOA', type: 'bool' },
          { internalType: 'bytes32', name: 'allowlistRoot', type: 'bytes32' },
        ],
        internalType: 'struct IAbridgedMintVector.AbridgedVector',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vectorId', type: 'uint256' },
      { internalType: 'uint48', name: 'numTokensToMint', type: 'uint48' },
      { internalType: 'address', name: 'mintRecipient', type: 'address' },
    ],
    name: 'vectorMint721',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];
