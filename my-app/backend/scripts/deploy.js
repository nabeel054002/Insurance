const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  const InsuranceContract = await ethers.getContractFactory(
    "SplitInsurance"
  );

  // deploy the contract
  const deployedInsuranceContract = await InsuranceContract.deploy();

  await deployedInsuranceContract.deployed();
  // print the address of the deployed contract
  console.log(
    "Contract Address:",
    deployedInsuranceContract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });