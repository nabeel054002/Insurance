const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")
const {Contract} = require("ethers")
const { Interface } = require("ethers/lib/utils");
const {Addr, implementationAbi} = require("../constants_proxy");

async function main() {
  let n=2;
  if(n==1){
    const AssistContract = await ethers.getContractFactory("SplitRiskV2Assist");
    const deployedAssistContract = await AssistContract.deploy({gasLimit: 30000000});
    await deployedAssistContract.deployed();
    console.log("Assist contract is deployed at ", deployedAssistContract.address);
  } else{
    const SplitInsuranceV2 = await ethers.getContractFactory("SplitInsuranceV2");
    const deployedSplitInsuranceV2 = await SplitInsuranceV2.deploy({gasLimit: 30000000});
    await deployedSplitInsuranceV2.deployed();
    console.log("SplitInsuranceV2 contract is deployed at ", deployedSplitInsuranceV2.address);
    //deployed the implementation contract 

    const Proxy = await ethers.getContractFactory("Proxy");
    const impIface = new Interface([
      "function initialize(address _Assist)"
    ])
    const calldata = impIface.encodeFunctionData("initialize", ["0x0b27a79cb9C0B38eE06Ca3d94DAA68e0Ed17F953"])//pass array of inputs to iface.encodeFunctionData
    //pass array of inputs to iface.encodeFunctionData  
    const deployedProxy = await Proxy.deploy(calldata, deployedSplitInsuranceV2.address, {gasLimit: 30000000});
    await deployedProxy.deployed();
    console.log("Proxy contract is deployed at ", deployedProxy.address);
    console.log("Assist contract as seen by implementation contract ", await deployedSplitInsuranceV2.S())
    // console.log("the assist contract is ",await deployedProxy.AssistContract())
    //deployed the proxy contract
    // const contract = new Contract(implementationAbi, deployedProxy.address, signer)
    //the problem is proxy is not able to read, and the implementation contract is not being able to get initialized
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /**
SplitInsuranceV2 contract is deployed at  0x021DBfF4A864Aa25c51F0ad2Cd73266Fde66199d
Proxy contract is deployed at  0x4CF4dd3f71B67a7622ac250f8b10d266Dc5aEbcE
   */