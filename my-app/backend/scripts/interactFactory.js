const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { BigNumber, Contract } = require("ethers");
const {factoryAbi, proxyAbi} = require("../constantsFactory")

//shouldve done deployment and interaction in same over here

async function main() {

    //task is to get the proxy addresses, the implementation addresses, and the values that i can upload as the available insurances

  const factoryAddr = "0xb6057e08a11da09a998985874FE2119e98dB3D5D"

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    // console.log(wallet)
    const factoryContract = new Contract(factoryAddr, factoryAbi, wallet);
    console.log("Factory contract's impl addr", await factoryContract.riskSpectrumContractsArray("0"))
    const arrLength = await factoryContract.riskSpectrumContractsArrayLength();
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

