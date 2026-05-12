export const MINTCLUB_ZAP_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokensToMint',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'mintWithEth',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];
