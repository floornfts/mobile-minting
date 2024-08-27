export const ZORA_TIMED_MINT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'mintTo',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'quantity',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'collection',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'mintReferral',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'comment',
        type: 'string',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

export const ZORA_FIXED_PRICE_ABI_MINT_WITH_REWARDS = [
  {
    inputs: [
      {
        internalType: 'contract IMinter1155',
        name: 'minter',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quantity',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'minterArguments',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: 'mintReferral',
        type: 'address',
      },
    ],
    name: 'mintWithRewards',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

export const ZORA_FIXED_PRICE_ABI = [
  {
    inputs: [
      {
        internalType: 'contract IMinter1155',
        name: 'minter',
        type: 'address',
      },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      {
        internalType: 'address[]',
        name: 'rewardsRecipients',
        type: 'address[]',
      },
      { internalType: 'bytes', name: 'minterArguments', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];