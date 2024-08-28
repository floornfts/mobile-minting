export const MANIFOLD_CLAIMS_ABI = [
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creatorContractAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "instanceId",
          "type": "uint256"
        },
        {
          "internalType": "uint16",
          "name": "mintCount",
          "type": "uint16"
        },
        {
          "internalType": "uint32[]",
          "name": "mintIndices",
          "type": "uint32[]"
        },
        {
          "internalType": "bytes32[][]",
          "name": "merkleProofs",
          "type": "bytes32[][]"
        },
        {
          "internalType": "address",
          "name": "mintFor",
          "type": "address"
        }
      ],
      "name": "mintProxy",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];
  

  export const MANIFOLD_CLAIMS_ERC721_SPECIFIC_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creatorContractAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "instanceId",
          "type": "uint256"
        }
      ],
      "name": "getClaim",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "total",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "totalMax",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "walletMax",
              "type": "uint32"
            },
            {
              "internalType": "uint48",
              "name": "startDate",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endDate",
              "type": "uint48"
            },
            {
              "internalType": "enum ILazyPayableClaim.StorageProtocol",
              "name": "storageProtocol",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "contractVersion",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "identical",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "location",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "cost",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "paymentReceiver",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "erc20",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "signingAddress",
              "type": "address"
            }
          ],
          "internalType": "struct IERC721LazyPayableClaim.Claim",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  export const MANIFOLD_CLAIMS_ERC115_SPECIFIC_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creatorContractAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "instanceId",
          "type": "uint256"
        }
      ],
      "name": "getClaim",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "total",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "totalMax",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "walletMax",
              "type": "uint32"
            },
            {
              "internalType": "uint48",
              "name": "startDate",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endDate",
              "type": "uint48"
            },
            {
              "internalType": "enum ILazyPayableClaim.StorageProtocol",
              "name": "storageProtocol",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "location",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cost",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "paymentReceiver",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "erc20",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "signingAddress",
              "type": "address"
            }
          ],
          "internalType": "struct IERC1155LazyPayableClaim.Claim",
          "name": "claim",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];