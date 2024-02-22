require('dotenv').config()

const { ethers, utils, Contract } = require('ethers')
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')
const { getPoolImmutables } = require('./helpers')

const ERC20ABI = require('./abi.json')
const weth = require('./weth.json')

const MAINNET_URL = "http://localhost:8545/"
// const MAINNET_URL = process.env.MAINNET_HTTP_URL
const providerMainnet = new ethers.providers.JsonRpcProvider(MAINNET_URL) // Mainnet - actual
const WALLET_SECRET = process.env.PRIVATE_KEY
const wethAddress = weth.address;
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545/") // Mainnet - forking
const poolAddress = "0x60594a405d53811d3BC4766596EFD80fd545A270" // UNI/WETH
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
const decimals0 = 18
const address0 = wethAddress

const swapWETHForDAI = async () => {
    const poolContractMainnet = new Contract(
        poolAddress,
        IUniswapV3PoolABI,
        providerMainnet
    )
    console.log('26')
    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)
    console.log('29', await poolContractMainnet.token0())
    console.log('30', await poolContractMainnet.token1())
    console.log('31', await poolContractMainnet.fee())
    const immutables = await getPoolImmutables(poolContractMainnet)
    console.log('30')
    const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )

    const inputAmount = 1
    // .001 => 1 000 000 000 000 000
    console.log('39')
    const amountIn = utils.parseUnits(
        inputAmount.toString(),
        decimals0
    )
    console.log('amountin', amountIn)
    //1000,000,000,000,000,000,000
    const approvalAmount = (amountIn).toString()
    //100,000,000,000,000,000,000
    console.log('approvalAmonut', approvalAmount)
    const tokenContract0 = new ethers.Contract(
        address0,
        ERC20ABI,
        provider
    )
    const connectedTokenContract = tokenContract0.connect(connectedWallet)
    const WALLET_ADDRESS = await connectedWallet.getAddress()
    const amt = await connectedTokenContract.balanceOf(WALLET_ADDRESS)
    console.log('amt', amt.toString())
    const approvalResponse = await connectedTokenContract.approve(
        swapRouterAddress,
        "1100000000000000000"
    )
    console.log('60')
    await approvalResponse.wait()
    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: immutables.fee,
        recipient: WALLET_ADDRESS,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }
    console.log('73')
    const connectedSwapsContract = swapRouterContract.connect(connectedWallet)
    try{
        const transaction = await connectedSwapsContract.exactInputSingle(
            params,
            {
            gasLimit: utils.hexlify(1000000)
            }
        )
        console.log('74')
        await transaction.wait()
        console.log('Done!')
    } catch(err){
        console.log('eror r', err)
    }
}
// try{
//     swapWETHForDAI()
// } catch(err){
//     console.log('error is:', err)
// }

module.exports = { swapWETHForDAI }
