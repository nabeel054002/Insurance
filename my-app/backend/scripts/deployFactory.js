const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const {Contract} = require("ethers")
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")
const {factoryAbi} = require("../constants_proxy.js")

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    // console.log("signer fetched", signer)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const AssistContract = await ethers.getContractFactory("SplitRiskV2Assist");
    const deployedAssistContract = await AssistContract.deploy("0x6B175474E89094C44Da98b954EedeAC495271d0F", "0x028171bCA77440897B824Ca71D1c56caC55b68A3","0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", {gasLimit: 30000000});
    await deployedAssistContract.deployed();
    // console.log(`const assistAddr = "${deployedAssistContract.address}"`);
    const RiskSpectrumContract = await ethers.getContractFactory(
        "SplitInsuranceV2"
      );
    
    // deploy the contract
    const deployedRiskSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});

    await deployedRiskSpectrumContract.deployed();
    // print the address of the deployed contract
    // console.log(`const implementationAddr = "${deployedRiskSpectrumContract.address}"`)

    const factory = await ethers.getContractFactory("RiskSpectrumFactory");
    const deployedFactory = await factory.deploy({gasLimit: 30000000});
    await deployedFactory.deployed();
    // console.log(`const factoryAddr = "${deployedFactory.address}"`);

    const factoryContract = new Contract(deployedFactory.address, factoryAbi, wallet);
    // console.log(factoryContract)
    const tx = await factoryContract.deployRiskSpectrum(deployedRiskSpectrumContract.address, {gasLimit: 30000000});
    await tx.wait();
    

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  ///TransparentUpgradeableProxy use this to deploy the proxy contract, then use the proxy contract to deploy the implementation contract

  