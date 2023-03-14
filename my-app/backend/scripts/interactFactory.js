const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { BigNumber, Contract } = require("ethers");
const {utils} = require("web3")
const {factoryAbi, proxyAbi} = require("../constantsFactory")

//shouldve done deployment and interaction in same over here

async function main() {

    //task is to get the proxy addresses, the implementation addresses, and the values that i can upload as the available insurances

    const assistAddr = "0x47c05BCCA7d57c87083EB4e586007530eE4539e9"
  const factoryAddr = "0x40A633EeF249F21D95C8803b7144f19AAfeEF7ae"
  const riskSpectrumAddr = "0x408F924BAEC71cC3968614Cb2c58E155A35e6890"
  const secondRiskSpectrumAddr = "0x773330693cb7d5D233348E25809770A32483A940"
  const thirdRiskSpectrumAddr = "0x52173b6ac069619c206b9A0e75609fC92860AB2A"

    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
    const factoryContract = new Contract(factoryAddr, factoryAbi, wallet);
    // console.log("Factory contract", factoryContract)
    const arrLength = await factoryContract.riskSpectrumContractsArrayLength();
    console.log(arrLength)
    const proxyContracts = [];
    const implementationContracts = [];
    const descriptionArr = [];
    for(let i = 0; i < arrLength; i++){
        const proxyContract = new Contract(await factoryContract.riskSpectrumContractsArray(i), proxyAbi, wallet);
        proxyContracts.push(proxyContract.address);
        const implementationContract = new Contract(await proxyContract.implementation(), proxyAbi, wallet);
        implementationContracts.push(implementationContract.address);
        const description = await factoryContract.detailsOfRiskSpectrums(proxyContract.address);
        console.log(description.slice(0,3));
        descriptionArr.push(description);
    }
    console.log("proxyContracts", proxyContracts)
    console.log("implementationContracts", implementationContracts)
    console.log("descriptionArr", descriptionArr)


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  ///TransparentUpgradeableProxy use this to deploy the proxy contract, then use the proxy contract to deploy the implementation contract

