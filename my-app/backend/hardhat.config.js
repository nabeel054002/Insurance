require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const MAINNET_HTTP_URL = process.env.MAINNET_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhatServer:{
      url:"http://127.0.0.1:8545/",
      chainId:1,
    },
    hardhat:{
      forking:{
        enabled:true,
        url:process.env.MAINNET_HTTP_URL,
        accounts:[process.env.PRIVATE_KEY],
      },
      chainId:1,
  },
}
}
