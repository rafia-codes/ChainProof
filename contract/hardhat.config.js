import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config';

const config = {
  solidity: {
    version: "0.8.28",
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/'
    },
    amoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

export default config;