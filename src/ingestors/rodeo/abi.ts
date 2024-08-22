export const RODEO_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'saleTermsId', type: 'uint256' },
      { internalType: 'address payable', name: 'referrer', type: 'address' },
    ],
    name: 'getFixedPriceSale',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'multiTokenContract', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'pricePerQuantity', type: 'uint256' },
          { internalType: 'uint256', name: 'quantityAvailableToMint', type: 'uint256' },
          { internalType: 'address payable', name: 'creatorPaymentAddress', type: 'address' },
          { internalType: 'uint256', name: 'generalAvailabilityStartTime', type: 'uint256' },
          { internalType: 'uint256', name: 'mintEndTime', type: 'uint256' },
          { internalType: 'uint256', name: 'creatorRevenuePerQuantity', type: 'uint256' },
          { internalType: 'uint256', name: 'referrerRewardPerQuantity', type: 'uint256' },
          { internalType: 'uint256', name: 'worldCuratorRevenuePerQuantity', type: 'uint256' },
          { internalType: 'uint256', name: 'protocolFeePerQuantity', type: 'uint256' },
        ],
        internalType: 'struct MultiTokenDropMarketFixedPriceSale.GetFixedPriceSaleResults',
        name: 'results',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'saleTermsId', type: 'uint256' },
      { internalType: 'uint256', name: 'tokenQuantity', type: 'uint256' },
      { internalType: 'address', name: 'tokenRecipient', type: 'address' },
      { internalType: 'address payable', name: 'referrer', type: 'address' },
    ],
    name: 'mintFromFixedPriceSale',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];
