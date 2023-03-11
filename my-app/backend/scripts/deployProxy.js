const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")
const {Contract} = require("ethers")
const { Interface } = require("ethers/lib/utils");

async function main() {
  console.log("main etnered")
  const SplitInsuranceV2 = await ethers.getContractFactory("SplitInsuranceV2");
  console.log("split insurance v2 fetched")
  //["60", "120", "120", "0x6B175474E89094C44Da98b954EedeAC495271d0F", "0x028171bCA77440897B824Ca71D1c56caC55b68A3", "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"]
  const deployedSplitInsuranceV2 = await SplitInsuranceV2.deploy({gasLimit: 30000000});
  console.log("deploying split insurance v2")
  await deployedSplitInsuranceV2.deployed();
  console.log("SplitInsuranceV2 contract is deployed at ", deployedSplitInsuranceV2.address);
  
  const Proxy = await ethers.getContractFactory("Proxy");
  const impIface = new Interface([
    "function initialize (uint256 _s,  uint256 _t1, uint256 _t2, uint256 _t3, address _c, address _cx, address _cy)"
  ])
  // const calldata = impIface.encodeFunctionData("initialize", ["60", "120", "120", "0x6B175474E89094C44Da98b954EedeAC495271d0F", "0x028171bCA77440897B824Ca71D1c56caC55b68A3", "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"])//pass array of inputs to iface.encodeFunctionData
  // //pass array of inputs to iface.encodeFunctionData
  // const deployedProxy = await Proxy.deploy(calldata, deployedSplitInsuranceV2.address, {
  //   gasLimit: 30000000,
  // });
  // await deployedProxy.deployed();

  // console.log("Proxy contract is deployed at ", deployedProxy.address);

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