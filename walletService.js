const axios = require("axios");
const config = require("./config.json");
const wallet = await this.walletService.generateWallet();
this.users[chatId] = {
  wallet: wallet,
  points: this.crapsGameLogic.initialPoints,
  bet: null,
};
await this.databaseService.saveUser(this.users[chatId]); // save user to database

class WalletService {
  constructor() {
    this.privyUrl = config.walletService.privyUrl;
    this.privyApiKey = config.walletService.privyApiKey;
  }

  async generateWallet() {
    try {
      const response = await axios.post(`${this.privyUrl}/api/v1/wallets`, {
        apiKey: this.privyApiKey,
      });

      if (response.status >= 200 && response.status < 300) {
        return response.data.wallet.address;
      } else {
        throw new Error("Failed to generate wallet");
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getWalletBalance(walletAddress) {
    try {
      const response = await axios.get(
        `${this.privyUrl}/api/v1/wallets/${walletAddress}/balance`,
        {
          headers: {
            "x-api-key": this.privyApiKey,
          },
        }
      );

      if (response.status === 200) {
        return response.data.balance;
      } else {
        throw new Error("Failed to get wallet balance");
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

module.exports = WalletService;
