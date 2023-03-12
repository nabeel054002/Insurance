const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
require("dotenv").config({ path: ".env" });
const {factoryAbi, factoryAddress, implementationAddr, assistAddr} = require("../constantsFactory.js");

async function main() {
    console.log("Main entered")
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    console.log("signer fetched", signer)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(factoryAddress, factoryAbi, wallet);
    // console.log(factoryContract)
    console.log("about to deploy risk spectrum")
    const tx = await contract.deployRiskSpectrum(implementationAddr, assistAddr, {gasLimit: 30000000});
    // console.log(tx);
    // await tx.wait();
    // console.log(tx);
    const map = await contract.riskSpectrums(implementationAddr, 0);
    console.log(map)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });