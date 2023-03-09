const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
require("dotenv").config({ path: ".env" });
const {proxyAddr, implementationAbi, implementationAddr} = require("../constants_proxy");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const implementationContract = new Contract(implementationAddr, implementationAbi, wallet);
    console.log("Assist contract as seen by implementation contract ", await implementationContract.assistContracAddr())
    const contract = new Contract(proxyAddr, implementationAbi, wallet);
    // console.log(contract); //doesnt mean much
    console.log("Invest call is about to be made")
    const tx = await contract.assistContracAddr()//maybe in the proxy contract it is only returning 0; and executing whatever is there in bwn the functinos, if so
    console.log("Invest call has been")
    console.log(tx);
    console.log("SplitRisk has been made")
    // await tx.wait();
    console.log("SplitRisk has been confirmed")

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /**
   * SplitInsuranceV2 contract is deployed at  0xAe2563b4315469bF6bdD41A6ea26157dE57Ed94e
Proxy contract is deployed at  0x30426D33a78afdb8788597D5BFaBdADc3Be95698
   */