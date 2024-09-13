export default [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "CallerNotController",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cldId",
        "type": "uint256"
      }
    ],
    "name": "CldAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "InvalidAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cldId",
        "type": "uint256"
      }
    ],
    "name": "InvalidCld",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidShares",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NothingToWithdraw",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cldId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "referralShare",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "communityShare",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "ecosystemShare",
        "type": "uint8"
      }
    ],
    "name": "CldRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cldId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "referer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountEth",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountERC20",
        "type": "uint256"
      }
    ],
    "name": "Collected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "holderTokenIds",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "ecosystemTokenIds",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "accountRewarder",
    "outputs": [
      {
        "internalType": "contract IAccountRewarder",
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
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "holderTokenIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "ecosystemTokenIds",
        "type": "uint256[]"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cldId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "referer",
        "type": "address"
      }
    ],
    "name": "collect",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cldId",
        "type": "uint256"
      }
    ],
    "name": "configurationOf",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "referralShare",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "communityShare",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "ecosystemShare",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "protocolShare",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "payoutTarget",
            "type": "address"
          },
          {
            "internalType": "contract IRegistry",
            "name": "registry",
            "type": "address"
          }
        ],
        "internalType": "struct IRewarder.CldConfiguration",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ecosystemRewarder",
    "outputs": [
      {
        "internalType": "contract IERC721BasedRewarder",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "holderRewarder",
    "outputs": [
      {
        "internalType": "contract IERC721BasedRewarder",
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
        "internalType": "contract IRegistry",
        "name": "registry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "referralShare",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "communityShare",
        "type": "uint8"
      }
    ],
    "name": "registerCld",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IAccountRewarder",
        "name": "rewarder",
        "type": "address"
      }
    ],
    "name": "setAccountRewarder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "controller",
        "type": "address"
      }
    ],
    "name": "setController",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC721BasedRewarder",
        "name": "rewarder",
        "type": "address"
      }
    ],
    "name": "setEcosystemRewarder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC721BasedRewarder",
        "name": "rewarder",
        "type": "address"
      }
    ],
    "name": "setHolderRewarder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "holderTokenIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "ecosystemTokenIds",
        "type": "uint256[]"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;