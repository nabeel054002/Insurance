const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
require("dotenv").config({ path: ".env" });
const{ Addr, Abi, Cx, Cy, CxAbi, CyAbi, dai, daiAbi } = require("../constants.js");


async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const c = new Contract(dai, daiAbi, wallet);
    console.log("DAI ka balance", await c.balanceOf(Addr));
    console.log("DAI ka balance", await c.balanceOf("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"));
    console.log("DAI ka balance for user is", await c.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });