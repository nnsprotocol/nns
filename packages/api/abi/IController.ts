export default [
  {
    inputs: [],
    name: "CldAlreadyExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "provided",
        type: "uint256",
      },
    ],
    name: "InsufficientTransferAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCld",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidLabel",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPricingOracle",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRegistrationMethod",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRegistrationPeriod",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "NonExpiringCld",
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
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "registry",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "hasExpiringNames",
        type: "bool",
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
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "required",
        type: "bool",
      },
    ],
    name: "CldSignatureRequiredChanged",
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
      {
        indexed: false,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "PricingOracleChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "isExpiringCLD",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
    ],
    name: "isSignatureRequired",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
    ],
    name: "pricingOracleOf",
    outputs: [
      {
        internalType: "contract IPricingOracle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "string[]",
        name: "labels",
        type: "string[]",
      },
      {
        internalType: "bool",
        name: "withReverse",
        type: "bool",
      },
      {
        internalType: "address",
        name: "referer",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "periods",
        type: "uint8",
      },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "communityReward",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "referralReward",
        type: "uint8",
      },
      {
        internalType: "contract IPricingOracle",
        name: "pricingOracle",
        type: "address",
      },
      {
        internalType: "address",
        name: "communityPayable",
        type: "address",
      },
      {
        internalType: "address",
        name: "communityManager",
        type: "address",
      },
      {
        internalType: "bool",
        name: "hasExpiringNames",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isDefaultCldResolver",
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
        name: "to",
        type: "address",
      },
      {
        internalType: "string[]",
        name: "labels",
        type: "string[]",
      },
      {
        internalType: "bool",
        name: "withReverse",
        type: "bool",
      },
      {
        internalType: "address",
        name: "referer",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "periods",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "registerWithSignature",
    outputs: [],
    stateMutability: "payable",
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
    name: "registryOf",
    outputs: [
      {
        internalType: "contract IRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string[]",
        name: "labels",
        type: "string[]",
      },
      {
        internalType: "uint8",
        name: "periods",
        type: "uint8",
      },
    ],
    name: "renew",
    outputs: [],
    stateMutability: "payable",
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
        internalType: "bool",
        name: "requiresSignature",
        type: "bool",
      },
    ],
    name: "setCldSignatureRequired",
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
      {
        internalType: "contract IPricingOracle",
        name: "oracle",
        type: "address",
      },
    ],
    name: "setPricingOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "signer",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
    ],
    name: "updateSigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
