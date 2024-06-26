export const zoraMintAbi = [
    {
      'inputs': [],
      'name': 'mintFee',
      'outputs': [
          {
              'internalType': 'uint256',
              'name': '',
              'type': 'uint256'
          }
      ],
      'stateMutability': 'view',
      'type': 'function'
  },
  {
      'inputs': [
          {
              'internalType': 'contract IMinter1155',
              'name': 'minter',
              'type': 'address'
          },
          {
              'internalType': 'uint256',
              'name': 'tokenId',
              'type': 'uint256'
          },
          {
              'internalType': 'uint256',
              'name': 'quantity',
              'type': 'uint256'
          },
          {
              'internalType': 'bytes',
              'name': 'minterArguments',
              'type': 'bytes'
          },
          {
              'internalType': 'address',
              'name': 'mintReferral',
              'type': 'address'
          }
      ],
      'name': 'mintWithRewards',
      'outputs': [],
      'stateMutability': 'payable',
      'type': 'function'
  },
  ];