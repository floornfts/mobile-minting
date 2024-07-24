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
  