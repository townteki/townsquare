const range = require('lodash.range');

const BaseStep = require('./basestep');

class ChooseGRSourceAmounts extends BaseStep {
    constructor(game, spendParams, callback) {
        super(game);

        this.remainingAmount = spendParams.amount;
        this.player = spendParams.player;
        this.sources = this.player.getSpendableGhostRockSources(spendParams);
        this.spendParams = spendParams;
        this.callback = callback;
    }

    continue() {
        while(this.sources.length > 0) {
            if(this.remainingAmount === 0) {
                return;
            }

            this.currentSource = this.sources.shift();
            let currentAvailable = this.currentSource.ghostrock;
            let maxAmount = Math.min(this.remainingAmount, currentAvailable);
            let minAmount = Math.max(0, this.remainingAmount - this.getMaxRemainingAvailable());

            if(this.sources.length > 0 && minAmount !== maxAmount) {
                let buttons = range(minAmount, maxAmount + 1).reverse().map(amount => {
                    return { text: amount.toString(), method: 'payGhostRock', arg: amount };
                });
                this.game.promptWithMenu(this.player, this, {
                    activePrompt: {
                        menuTitle: `Select amount from ${this.currentSource.title}`,
                        buttons: buttons
                    }
                });
                return false;
            }

            this.payGhostRock(this.player, maxAmount);
        }
    }

    getMaxRemainingAvailable() {
        return this.sources.reduce((sum, source) => sum + source.ghostrock, 0);
    }

    payGhostRock(player, amount) {
        this.remainingAmount -= amount;
        this.currentSource.modifyGhostRock(-amount);

        if(this.remainingAmount === 0) {
            this.callback();
        }

        return true;
    }
}

module.exports = ChooseGRSourceAmounts;
