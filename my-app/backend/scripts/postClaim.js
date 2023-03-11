const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
require("dotenv").config({ path: ".env" });
const {proxyAddr, implementationAbi, implementationAddr} = require("../constants_proxy.js");

async function main() {
    console.log("Main entered")
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    console.log("signer fetched", signer)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(proxyAddr, implementationAbi, wallet);
    console.log("contract fetched", contract)
    console.log("claim function must have been called")
    console.log("cBlnce is", await contract.cBlnce());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });