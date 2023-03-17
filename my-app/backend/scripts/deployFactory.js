const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { BigNumber, Contract } = require("ethers");
const {utils} = require("web3")
const {factoryAbi, proxyAbi} = require("../constantsFactory")

//shouldve done deployment and interaction in same over here

async function main() {
  
    const AssistContract = await ethers.getContractFactory("SplitRiskV2Assist");
    const deployedAssistContract = await AssistContract.deploy("0x6B175474E89094C44Da98b954EedeAC495271d0F", "0x028171bCA77440897B824Ca71D1c56caC55b68A3","0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", {gasLimit: 30000000});
    await deployedAssistContract.deployed();

    const RiskSpectrumContract = await ethers.getContractFactory(
        "SplitInsuranceV2"
      );
    
    // deploy the contract
    const deployedRiskSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});
    await deployedRiskSpectrumContract.deployed();
    const secondDeployedSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});
    await secondDeployedSpectrumContract.deployed();
    // console.log(`const riskSpectrumAddr = "${deployedRiskSpectrumContract.address}"`);
    const thirdDeployedSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});
    await thirdDeployedSpectrumContract.deployed();
    const factory = await ethers.getContractFactory("RiskSpectrumFactory");
    const deployedFactory = await factory.deploy({gasLimit: 30000000});
    await deployedFactory.deployed();
    console.log("Assist, Implementation and Factory contract has been deployed");
    console.log("the next step is to deploy the proxy and by deploying the proxy the implementation of the proxy naturally gets initialized")
    
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(deployedFactory.address, factoryAbi, wallet);
    const tx2 = await contract.deployRiskSpectrum(deployedRiskSpectrumContract.address, deployedAssistContract.address);
    await tx2.wait();
    const tx3 = await contract.deployRiskSpectrum(secondDeployedSpectrumContract.address, deployedAssistContract.address);
    await tx3.wait();
    const tx4 = await contract.deployRiskSpectrum(thirdDeployedSpectrumContract.address, deployedAssistContract.address);
    await tx4.wait();

    console.log("have deployed the proxy contracts and hence initialized them as well")

    // console.log("deployed proxy for risk spectrum contract", await contract.riskSpectrumContracts(deployedRiskSpectrumContract.address))
    // const tx = await contract.returnData(deployedRiskSpectrumContract.address);
    // console.log(await tx.wait());

    // const proxyContract = new ethers.Contract(await contract.riskSpectrumContracts(secondDeployedSpectrumContract.address), proxyAbi, wallet);
    // console.log("proxy contract", proxyContract.address)
    // const implementation = await proxyContract.implementation();//why is this giving address of assist, but in console.log solidity it is giving the actual implementation contract`s address
    // console.log("implementation", implementation);

    // console.log("trial to see if i get the struct");

    console.log(`const assistAddr = "${deployedAssistContract.address}"`);
    console.log(`const factoryAddr = "${deployedFactory.address}"`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  ///TransparentUpgradeableProxy use this to deploy the proxy contract, then use the proxy contract to deploy the implementation contract

