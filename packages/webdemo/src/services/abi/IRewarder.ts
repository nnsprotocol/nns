export default [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cldId",
        type: "uint256",
      },
    ],
    name: "CldAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "HoldersSnapshotTooEarly",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "InvalidAccount",
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
    name: "InvalidCld",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidShares",
    type: "error",
  },
  {
    inputs: [],
    name: "NothingToWithdraw",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "mintBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "snapshotBlock",
        type: "uint256",
      },
    ],
    name: "TokenNotInSnapshot",
    type: "error",
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
      {
        internalType: "address",
        name: "registry",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "TokenNotOwned",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "accont",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "delta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BalanceChanged",
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
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "referralShare",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "communityShare",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "ecosystemShare",
        type: "uint8",
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
        internalType: "address",
        name: "referer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountEth",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountERC20",
        type: "uint256",
      },
    ],
    name: "Collected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "reward",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unclaimed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockTimestamp",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct IRewarder.HolderRewardsSnapshot",
        name: "",
        type: "tuple",
      },
    ],
    name: "HolderRewardsSnapshotCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "delta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "HoldersBalanceChanged",
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
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
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
    name: "balanceOf",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "balanceOf",
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
    name: "balanceOfHolders",
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
        internalType: "address",
        name: "referer",
        type: "address",
      },
    ],
    name: "collect",
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
    name: "configurationOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "referralShare",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "communityShare",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "ecosystemShare",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocolShare",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isCldSplitRewards",
            type: "bool",
          },
          {
            internalType: "address",
            name: "payoutTarget",
            type: "address",
          },
          {
            internalType: "contract IRegistry",
            name: "registry",
            type: "address",
          },
        ],
        internalType: "struct IRewarder.CldConfiguration",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "holderRewardsSnapshot",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "reward",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unclaimed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockTimestamp",
            type: "uint256",
          },
        ],
        internalType: "struct IRewarder.HolderRewardsSnapshot",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "previewHolderRewardsSnapshot",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "reward",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unclaimed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockTimestamp",
            type: "uint256",
          },
        ],
        internalType: "struct IRewarder.HolderRewardsSnapshot",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "referralShare",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "communityShare",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isCldSplitRewards",
        type: "bool",
      },
    ],
    name: "registerCld",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "takeHolderRewardsSnapshot",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "withdraw",
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
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "withdrawForCommunity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
