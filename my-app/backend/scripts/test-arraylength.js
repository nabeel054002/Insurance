
const { ethers } = require("hardhat");
const { BigNumber, Contract } = require("ethers");
const {factoryAddr, factoryAbi} = require("../constantsFactory")
// Load the environment variables from the .env file
require("dotenv").config({ path: ".env" });

// Access the environment variables and console.log them
console.log('API_KEY:', process.env.MAINNET_HTTP_URL);

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const signer = provider.getSigner();
    console.log(process.env.PRIVATE_KEY)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('wallet')
    // const signerWallet = await wallet.getSigner();
    // console.log('signerWallet', signerWallet)
    const contract = new Contract(factoryAddr, factoryAbi, wallet);
    console.log('contract', contract)
    console.log('arr length',  contract.riskSpectrumContractsArrayLength())
}

main().then(() => console.log('Done'))
.catch((e) => console.log('error', e))