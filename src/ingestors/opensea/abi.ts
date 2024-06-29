export const OPENSEA_ABI = [
    {
      "inputs": [],
      "name": "contractURI",
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
          "name": "seaDropImpl",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint80",
              "name": "mintPrice",
              "type": "uint80"
            },
            {
              "internalType": "uint48",
              "name": "startTime",
              "type": "uint48"
            },
            {
              "internalType": "uint48",
              "name": "endTime",
              "type": "uint48"
            },
            {
              "internalType": "uint16",
              "name": "maxTotalMintableByWallet",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "restrictFeeRecipients",
              "type": "bool"
            }
          ],
          "internalType": "struct PublicDrop",
          "name": "publicDrop",
          "type": "tuple"
        }
      ],
      "name": "updatePublicDrop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "minter",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "mintSeaDrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
  ];