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
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "riskSpectrums",
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
  
const factoryAddress = "0xdB012DD3E3345e2f8D23c0F3cbCb2D94f430Be8C"
const implementationAddr = "0x532802f2F9E0e3EE9d5Ba70C35E1F43C0498772D"
const assistAddr = "0x40A633EeF249F21D95C8803b7144f19AAfeEF7ae";
module.exports = {factoryAbi, factoryAddress, implementationAddr, assistAddr}