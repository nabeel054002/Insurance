const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
require("dotenv").config({ path: ".env" });
const {proxyAddr, implementationAbi, implementationAddr} = require("../constants_proxy.js");

async function main() {
    console.log("Main entered")
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(proxyAddr, implementationAbi, wallet);
    const tx = await contract.invest({
        gasLimit: 30000000,
    });
    console.log("Invest call in progress")
    await tx.wait();
    console.log("Invest call has been made");
    console.log("cBalance is", await contract.cBalance())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });