const { ethers, utils, Contract } = require('ethers')
const weth = require('./weth.json')
const wethAddress = weth.address;
const wethABI = weth.abi

require('dotenv').config()
const MAINNET_URL = "http://localhost:8545/"
// const MAINNET_URL=process.env.MAINNET_URL
const WALLET_SECRET = process.env.PRIVATE_KEY
console.log('WALLET_SECRET', WALLET_SECRET)
const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL) // Ropsten

const { swapWETHForDAI } = require("./WethForDai");

async function main() {
    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)
    console.log('weth', wethAddress)
    const wethContract = new ethers.Contract(wethAddress, wethABI, provider);
    console.log('wethContract')
    const connectedWethContract = wethContract.connect(connectedWallet);
    console.log('abt to get WETH')
    try{
        await connectedWethContract.totalSupply()
    } catch(err){
        console.log("error in fetching total supply", err)
    }
    const tx = await connectedWethContract.deposit({ value: ethers.utils.parseUnits("1", "ether") })//get 1 ether worth of 
    await tx.wait();
    //1 ether gets converted to weth
    console.log('got WETH')
    await swapWETHForDAI();
    console.log('Done!')
}

main()