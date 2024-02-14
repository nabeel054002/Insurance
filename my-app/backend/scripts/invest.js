const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
require("dotenv").config({ path: ".env" });
const {Addr, Abi, Cx, Cy, CxAbi, CyAbi} = require("../constants.js");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new Contract(Addr, Abi, wallet);
    console.log("Invest call is about to be made")
    const tx = await contract.invest({
        gasLimit: 30000000,
    });
    console.log("Invest call has been")
    await tx.wait();
    console.log("Invest call has been made");
    const cx = new Contract(Cx, CxAbi, wallet)
    const cy = new Contract(Cy, CyAbi, wallet)
    
    console.log("aDAI ka balance", await cx.balanceOf(Addr));
    console.log("cDAI ka balance", await cy.balanceOf(Addr));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });