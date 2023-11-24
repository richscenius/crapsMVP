const config = require("./config.json");

class CrapsGameLogic {
  constructor() {
    this.bettingOptions = config.crapsGameLogic.bettingOptions;
    this.rollInterval = config.crapsGameLogic.rollInterval;
    this.initialPoints = config.crapsGameLogic.initialPoints;
    this.betaPeriod = config.crapsGameLogic.betaPeriod;
  }

  rollDice() {
    return (
      Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1
    );
  }

  calculateResultAndPayout(betType, rollResult, point, betAmount) {
    if (!betAmount || !betType || point === undefined) {
      throw new Error("Bet amount, bet type or point is not defined");
    }
    let result = null;
    let payout = 0;

    const winConditions = {
      Pass: [7, 11, point],
      DontPass: [2, 3, 12],
      Come: [7, 11, point],
      DontCome: [2, 3],
      Field: [3, 4, 9, 10, 11, 2, 12],
      Place6: [6],
      Place8: [8],
      Place5: [5],
      Place9: [9],
      Place4: [4],
      Place10: [10],
      PassComeOdds: [point],
      DontPassDontComeOdds: [7],
      Hardways4: [2, 2],
      Hardways6: [3, 3],
      Hardways8: [4, 4],
      Hardways10: [5, 5],
    };

    const loseConditions = {
      Pass: [2, 3, 12, 7],
      DontPass: [7, 11, point],
      Come: [2, 3, 12, 7],
      DontCome: [7, 11, point],
      Field: [5, 6, 7, 8],
      Place6: [7],
      Place8: [7],
      Place5: [7],
      Place9: [7],
      Place4: [7],
      Place10: [7],
      PassComeOdds: [7],
      DontPassDontComeOdds: [point],
      Hardways4: [7, [1, 3], [3, 1]],
      Hardways6: [7, [1, 5], [2, 4], [4, 2], [5, 1]],
      Hardways8: [7, [2, 6], [3, 5], [5, 3], [6, 2]],
      Hardways10: [7, [4, 6], [6, 4]],
    };

    const payouts = {
      Pass: 2,
      DontPass: 2,
      Come: 2,
      DontCome: 2,
      Field: rollResult === 2 || rollResult === 12 ? 3.75 : 2,
      Place6: 1 + (6 / 5) * 0.985,
      Place8: 1 + (6 / 5) * 0.985,
      Place5: 1 + (3 / 2) * 0.985,
      Place9: 1 + (3 / 2) * 0.985,
      Place4: 1 + 2 * 0.985,
      Place10: 1 + 2 * 0.985,
      PassComeOdds:
        point === 6 || point === 8
          ? 1 + 6 / 5
          : point === 5 || point === 9
          ? 1 + 3 / 2
          : 1 + 2,
      DontPassDontComeOdds:
        point === 6 || point === 8
          ? 1 + 5 / 6
          : point === 5 || point === 9
          ? 1 + 2 / 3
          : 1 + 1 / 2,
      Hardways4: 8,
      Hardways6: 10,
      Hardways8: 10,
      Hardways10: 8,
    };

    if (winConditions[betType].includes(rollResult)) {
      result = "win";
      payout = betAmount * payouts[betType];
    } else if (loseConditions[betType].includes(rollResult)) {
      result = "lose";
      payout = 0;
    } else {
      result = "point";
    }

    return { result, payout };
  }

  isValidBet(betType, betAmount, userPoints, originalBet) {
    if (!betAmount || !betType) {
      throw new Error("Bet amount or bet type is not defined");
    }
    if (betType === "PassComeOdds" || betType === "DontPassDontComeOdds") {
      // For odds bets, the bet amount must not exceed twice the original bet
      return (
        this.bettingOptions.includes(betType) &&
        betAmount <= userPoints &&
        betAmount <= 2 * originalBet
      );
    } else {
      return this.bettingOptions.includes(betType) && betAmount <= userPoints;
    }
  }
}

module.exports = CrapsGameLogic;
