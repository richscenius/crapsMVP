const Web3 = require("web3");
const config = require("./config.json");

class BlockchainService {
  constructor() {
    this.web3 = new Web3(config.blockchainService.chainUrl);
    this.contractAddress = config.blockchainService.contractAddress;
    this.privateKey = config.blockchainService.privateKey;
    this.gasPrice = config.blockchainService.gasPrice;
    this.gasLimit = config.blockchainService.gasLimit;
    this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    this.web3.eth.accounts.wallet.add(this.account);
    this.web3.eth.defaultAccount = this.account.address;
  }

  async sendTransaction(to, value) {
    try {
      let valueInWei;

      if (typeof value === "string" && value.includes("ether")) {
        valueInWei = this.web3.utils.toWei(value.split(" ")[0], "ether");
      } else {
        valueInWei = this.web3.utils.toWei(value.toString(), "ether");
      }

      const transaction = {
        to: to,
        value: valueInWei,
        gas: this.gasLimit,
        gasPrice: this.web3.utils.toWei(this.gasPrice, "gwei"),
      };

      const signedTransaction = await this.web3.eth.accounts.signTransaction(
        transaction,
        this.privateKey
      );
      const receipt = await this.web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction
      );
      return receipt;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, "ether");
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getTransactionCount(address) {
    try {
      const transactionCount = await this.web3.eth.getTransactionCount(address);
      return transactionCount;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

module.exports = BlockchainService;
