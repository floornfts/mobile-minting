export const RARIBLE_ABI = [
    {
        inputs:[],
        name:"claimCondition",
        outputs: [
            {
                internalType: "uint256",
                name: "currentStartId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "count",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type:"function"
        },
    {
        inputs: [
            {
                internalType:"uint256",
                name:"_conditionId",
                type:"uint256"
            }
        ],
        name: "getClaimConditionById",
        outputs: [
            {
                components:[
                    {
                        internalType: "uint256",
                        name: "startTimestamp",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256", 
                        name: "maxClaimableSupply", 
                        type: "uint256"
                    },
                    {
                        internalType: "uint256", 
                        name: "supplyClaimed",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "quantityLimitPerWallet",
                        type: "uint256"
                    },
                    {
                        internalType:"bytes32",
                        name: "merkleRoot",
                        type: "bytes32"
                    },
                    { 
                        internalType: "uint256",
                        name: "pricePerToken",
                        type: "uint256"
                    },
                    {
                        internalType: "address",
                        name: "currency",
                        type: "address"
                    },
                    { 
                        internalType: "string",
                        name: "metadata",
                        type: "string"
                    }
                ],
                internalType: "struct IClaimCondition.ClaimCondition",
                name: "condition",
                type:"tuple"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "sharedMetadata",
        outputs: [
            {
                internalType: "string",
                name: "name",
                type: "string"
            },
            {
                internalType: "string",
                name: "description",
                type: "string"
            },
            {
                internalType: "string",
                name: "imageURI", 
                type: "string"
            },
            {
                internalType: "string",
                name: "animationURI",
                type: "string"
            }
        ],
        stateMutability: "view",
        type: "function"
    }, 
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    }
]

