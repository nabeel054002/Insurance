const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  console.log("this is the main function")
  const InsuranceContract = await ethers.getContractFactory(
    "SplitInsurance"
  );
  console.log("Found contract")

  // deploy the contract
  const deployedInsuranceContract = await InsuranceContract.deploy();
    console.log("deploying contract")
  await deployedInsuranceContract.deployed();
  // print the address of the deployed contract
  console.log(
    "Contract Address:",
    deployedInsuranceContract.address
  );
  console.log(await deployedInsuranceContract.S());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });