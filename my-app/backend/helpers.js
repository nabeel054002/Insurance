const getPoolImmutables = async (poolContract) => {
  console.log('entered')
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee()
    ])
    console.log('here!')
  
    const immutables = {
      token0: token0,
      token1: token1,
      fee: fee
    }
    console.log('abt to return!!')
    return immutables
  }
  
const getPoolState = async (poolContract) => {
    const slot = poolContract.slot0()
  
    const state = {
      sqrtPriceX96: slot[0]
    }
  
    return state
  }

  module.exports = {getPoolImmutables, getPoolState}