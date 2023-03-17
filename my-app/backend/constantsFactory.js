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
    "inputs": [
      {
        "internalType": "address",
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
    "name": "detailsOfRiskSpectrums",
    "outputs": [
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
  }
]
module.exports = {proxyAbi, factoryAbi}