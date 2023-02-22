const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")

async function main() {
  const hash = utils.sha3('initialize(address _Assist)').substr(0,10);
  console.log(hash)
  // const hash = utils.sha3('initialize (uint256 _S, uint256 _T1,  uint256 _T2, uint256 _T3, address _c, address _x, address _cx, address _cy)').substr(0,10)
  
  const proxyAbi = [
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "constructData",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "contractLogic",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    }
  ]
  
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

  const proxy = await ethers.getContractFactory("Proxy");
  console.log("got proxy")
  const deployedProxy = await proxy.deploy(hash, deployedInsuraTranchContract.address, {
    gasLimit: 30000000,
  });
  console.log("deployed proxy")
  await deployedProxy.deployed();
  console.log("Proxy Contract Address: ", deployedProxy.address);
  //deployed proxy contract

  //now to initiailize the proxy contract
  // const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  // const signer = provider.getSigner();
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const proxyContract = new ethers.Contract(deployedProxy.address, proxyAbi, wallet);
  // const tx2 = await proxyContract.initialize();
  // await tx2.wait();
  // console.log("Proxy Contract Initialized");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });