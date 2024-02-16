const { Interface } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const {Contract} = require("ethers")
require("dotenv").config({ path: ".env" });
const {utils} = require("web3")
const {proxyAbi, factoryAbi} = require("../constantsFactory")

//shouldve done deployment and interaction in same over here

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('14')
    const AssistContract = await ethers.getContractFactory("SplitRiskV2Assist", signer);
    const deployedAssistContract = await AssistContract.deploy("0x6B175474E89094C44Da98b954EedeAC495271d0F", "0x028171bCA77440897B824Ca71D1c56caC55b68A3","0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", {gasLimit: 30000000});
    await deployedAssistContract.deployed();
    console.log('18')
    const RiskSpectrumContract = await ethers.getContractFactory(
        "SplitInsuranceV2",
        signer
      );
    console.log('21')
    // deploy the contract
    const deployedRiskSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});
    await deployedRiskSpectrumContract.deployed();
    const secondDeployedSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});
    await secondDeployedSpectrumContract.deployed();
    // console.log(`const riskSpectrumAddr = "${deployedRiskSpectrumContract.address}"`);
    const thirdDeployedSpectrumContract = await RiskSpectrumContract.deploy({gasLimit: 30000000});
    await thirdDeployedSpectrumContract.deployed();
    const factory = await ethers.getContractFactory("RiskSpectrumFactory", signer);
    const deployedFactory = await factory.deploy({gasLimit: 30000000});
    await deployedFactory.deployed();
    console.log("Assist, Implementation and Factory contract has been deployed");
    console.log("the next step is to deploy the proxy and by deploying the proxy the implementation of the proxy naturally gets initialized")

    console.log(`Factory Address, ${deployedFactory.address} `)
    console.log(`Deployed Risk Spectrum contract, ${thirdDeployedSpectrumContract.address} `)
    console.log(process.env.MAINNET_HTTP_URL)
    const contract = new Contract(deployedFactory.address, factoryAbi, signer);
    console.log('contract', await deployedFactory.riskSpectrumContractsArrayLength())
    await deployedFactory.deployRiskSpectrum(deployedRiskSpectrumContract.address, deployedAssistContract.address, { gasLimit: 5000000 });
    console.log('43')
    console.log('45')
    const tx3 = await deployedFactory.deployRiskSpectrum(secondDeployedSpectrumContract.address, deployedAssistContract.address);
    console.log('43')
    await tx3.wait();
    console.log('48')
    const tx4 = await deployedFactory.deployRiskSpectrum(thirdDeployedSpectrumContract.address, deployedAssistContract.address);
    await tx4.wait();

    console.log('riskspectrums', thirdDeployedSpectrumContract.address)

    console.log("have deployed the proxy contracts and hence initialized them as well")
    console.log(`const assistAddr = "${deployedAssistContract.address}"`);
    console.log(`const factoryAddr = "${deployedFactory.address}"`);

    console.log(await deployedFactory.riskSpectrumContractsArrayLength())

    //factory deploys the proxy contract and the exchange contract

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  ///TransparentUpgradeableProxy use this to deploy the proxy contract, then use the proxy contract to deploy the implementation contract

