const assistAddr = "0x31403b1e52051883f2Ce1B1b4C89f36034e1221D"
const factoryAddr = "0x0B32a3F8f5b7E5d315b9E52E640a49A89d89c820"

const proxyAbi = [
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "constructData",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "contractLogic",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "implementation",
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
    "stateMutability": "payable",
    "type": "receive"
  }
]
const factoryAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "liquidityProvider",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountA",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountB",
        "type": "uint256"
      }
    ],
    "name": "LiquidityAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "liquidityProvider",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountA",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountB",
        "type": "uint256"
      }
    ],
    "name": "LiquidityRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountAOut",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountBOut",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountAIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountBIn",
        "type": "uint256"
      }
    ],
    "name": "SwapExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "Implementation",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "Assist",
        "type": "address"
      }
    ],
    "name": "deployRiskSpectrum",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "liquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balanceA",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "balanceB",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_implementation",
        "type": "address"
      }
    ],
    "name": "returnData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "c",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cx",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cy",
            "type": "string"
          }
        ],
        "internalType": "struct RiskSpectrumFactory.riskSpectrum",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "riskSpectrumContracts",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "riskSpectrumContractsArray",
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
    "inputs": [],
    "name": "riskSpectrumContractsArrayLength",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "riskSpectrumExchangeContracts",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
module.exports = {proxyAbi, factoryAbi, factoryAddr, assistAddr}