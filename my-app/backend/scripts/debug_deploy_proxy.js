const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")

async function main() {
    const contractAddr = "0x408F924BAEC71cC3968614Cb2c58E155A35e6890";
    const contractAbi = [
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
          "name": "result_this",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      

      const contract = 
    //pass
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });