export default [
  {
    inputs: [],
    name: "CldAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCld",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "registry",
        type: "address",
      },
    ],
    name: "CldRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "DefaultCldChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "FallbackCldChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "defaultCldOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fallbackCld",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "key",
        type: "uint256",
      },
    ],
    name: "recordOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IRegistry",
        name: "registry",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isFallback",
        type: "bool",
      },
    ],
    name: "registerCld",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "reverseNameOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "cldIds",
        type: "uint256[]",
      },
      {
        internalType: "bool",
        name: "fallbackToDefault",
        type: "bool",
      },
    ],
    name: "reverseNameOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "cldIds",
        type: "uint256[]",
      },
      {
        internalType: "bool",
        name: "fallbackToDefault",
        type: "bool",
      },
    ],
    name: "reverseOf",
    outputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "reverseOf",
    outputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "setDefaultCld",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "setFallbackCld",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
