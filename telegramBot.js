const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const WalletService = require("./walletService.js");
const BlockchainService = require("./blockchainService.js");
const CrapsGameLogic = require("./crapsGameLogic.js");

class TelegramCrapsBot {
  constructor() {
    this.bot = new TelegramBot(config.telegramBot.token, { polling: true });
    this.walletService = new WalletService();
    this.blockchainService = new BlockchainService();
    this.crapsGameLogic = new CrapsGameLogic();
    this.users = {};
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        if (!this.users[chatId]) {
          const wallet = await this.walletService.generateWallet();
          this.users[chatId] = {
            wallet: wallet,
            points: this.crapsGameLogic.initialPoints,
            bet: null,
          };
          this.bot.sendMessage(
            chatId,
            `Welcome to ${config.telegramBot.gameName}! You have been given ${this.crapsGameLogic.initialPoints} points to start betting. Good luck!`
          );
        } else {
          this.bot.sendMessage(
            chatId,
            `Welcome back to ${config.telegramBot.gameName}! You currently have ${this.users[chatId].points} points.`
          );
        }
      } catch (error) {
        console.error(error);
      }
    });

    this.bot.onText(/\/bet (.+) (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const betType = match[1];
      const betAmount = Number(match[2]);
      try {
        if (
          this.crapsGameLogic.isValidBet(
            betType,
            betAmount,
            this.users[chatId].points
          )
        ) {
          this.users[chatId].bet = {
            type: betType,
            amount: betAmount,
          };
          this.bot.sendMessage(
            chatId,
            `You have placed a ${betType} bet of ${betAmount} points.`
          );
        } else {
          this.bot.sendMessage(
            chatId,
            `Invalid bet. Please make sure you have enough points and the bet type is correct.`
          );
        }
      } catch (error) {
        console.error(error);
      }
    });

    setInterval(() => {
      try {
        const rollResult = this.crapsGameLogic.rollDice();
        for (const userId in this.users) {
          if (this.users.hasOwnProperty(userId) && this.users[userId].bet) {
            const win = this.crapsGameLogic.calculateWin(
              this.users[userId].bet.type,
              rollResult
            );
            if (win) {
              const payout = this.crapsGameLogic.calculateResultAndPayout(
                this.users[userId].bet.type,
                rollResult,
                this.users[userId].bet.point,
                this.users[userId].bet.amount
              ).payout;
              this.users[userId].points += payout;
              this.bot.sendMessage(
                userId,
                `You won! The roll was ${rollResult}. Your payout is ${payout} points. You now have ${this.users[userId].points} points.`
              );
            } else {
              // Ensure the user's points have not changed
              const currentPoints = this.users[userId].points;
              if (currentPoints === this.users[userId].points) {
                this.users[userId].points -= this.users[userId].bet.amount;
                this.bot.sendMessage(
                  userId,
                  `You lost. The roll was ${rollResult}. You now have ${this.users[userId].points} points.`
                );
              } else {
                this.bot.sendMessage(
                  userId,
                  `Your points have changed. The bet is not valid.`
                );
              }
            }
            this.users[userId].bet = null;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }, this.crapsGameLogic.rollInterval * 1000);
  }
}

new TelegramCrapsBot();
