const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { Contract } = require("hardhat/internal/hardhat-network/stack-traces/model");
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")

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
  // print the address of the deployed contract

  const impIface = new Interface([
    "function initialize(address _Assist)"
  ])
  const calldata = impIface.encodeFunctionData("initialize", [deployedAssistContract.address])//pass array of inputs to iface.encodeFunctionData
  //pass array of inputs to iface.encodeFunctionData


  const proxy = await ethers.getContractFactory("Proxy");
  
  const deployedProxy = await proxy.deploy(calldata, deployedRiskSpectrumContract.address, {
    gasLimit: 30000000,
  });
  await deployedProxy.deployed();

  const proxyWithImplementation = await ethers.getContractAt("SplitInsuranceV2", deployedProxy.address);
  // console.log(await proxyWithImplementation)
  //no need to add the abi, can get using name of contract
  console.log(`const proxyAddr = "${deployedProxy.address}"`);
  console.log(`const implementationAddr = "${deployedRiskSpectrumContract.address}"`);
  console.log(`const assistAddr = "${deployedAssistContract.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  ///TransparentUpgradeableProxy use this to deploy the proxy contract, then use the proxy contract to deploy the implementation contract
