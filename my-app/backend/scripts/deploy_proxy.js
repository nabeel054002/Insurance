const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  const InsuraTranchContract = await ethers.getContractFactory(
    "InsuraTranch"
  );

  // deploy the contract
  const deployedInsuraTranchContract = await InsuraTranchContract.deploy();

  await deployedInsuraTranchContract.deployed();
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