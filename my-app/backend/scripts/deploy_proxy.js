const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")

async function main() {

  const AssistContract = await ethers.getContractFactory("SplitRiskV2Assist");
  const deployedAssistContract = await AssistContract.deploy({gasLimit: 30000000});
  await deployedAssistContract.deployed();

  console.log("Assist Contract Address:", deployedAssistContract.address);

  const InsuraTranchContract = await ethers.getContractFactory(
    "SplitInsuranceV2"
  );

  // deploy the contract
  const deployedInsuraTranchContract = await InsuraTranchContract.deploy({gasLimit: 30000000});

  await deployedInsuraTranchContract.deployed();
  // print the address of the deployed contract
  console.log(
    "Implementation Contract Address:",
    deployedInsuraTranchContract.address
  );

  const impIface = new Interface([
    "function initialize(address _Assist)"
  ])
  const calldata = impIface.encodeFunctionData("initialize", [deployedAssistContract.address])//pass array of inputs to iface.encodeFunctionData
  //pass array of inputs to iface.encodeFunctionData

  const proxy = await ethers.getContractFactory("Proxy");
  console.log("got proxy")
  const deployedProxy = await proxy.deploy(calldata, deployedInsuraTranchContract.address, {
    gasLimit: 30000000,
  });
  console.log("deployed proxy")
  await deployedProxy.deployed();
  console.log("Proxy Contract Address: ", deployedProxy.address);
  console.log("deployed proxy contract")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  ///TransparentUpgradeableProxy use this to deploy the proxy contract, then use the proxy contract to deploy the implementation contract
