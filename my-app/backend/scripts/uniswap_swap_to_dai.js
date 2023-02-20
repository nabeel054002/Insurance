const {BigNumber} = require("ethers");
const { ethers } = require("hardhat");
const {WETH, WETH_ABI, UNISWAPV3_ADDR, UNISWAPV3_ABI, POOL_ABI} = require("./constants_swap.js");
async function main() {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const signer = provider.getSigner();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    // const wethContract = new ethers.Contract(WETH, WETH_ABI, wallet);
    // const tx = await wethContract.deposit({value: ethers.utils.parseEther("1")});
    // await tx.wait();
    const uniswapContract = new ethers.Contract(UNISWAPV3_ADDR, UNISWAPV3_ABI, wallet);
    const pool = await uniswapContract.getPool(WETH, "0x6b175474e89094c44da98b954eedeac495271d0f", 3000);
    console.log(pool)
    const poolContract = new ethers.Contract(pool, POOL_ABI, wallet);
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();
    console.log("token 0 is", token0)
    console.log("token 1 is", token1)
    const addr = await wallet.getAddress();
    console.log(BigNumber.from("1"))
    const tx2 = await poolContract.swap(addr, 0, BigNumber.from("1"), "1823216000000006103515625", "0x", {
        gasLimit: 30000000,
    })
}

main();