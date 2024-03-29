const range = require('lodash.range');

const BaseStep = require('../gamesteps/basestep');

class XValuePrompt extends BaseStep {
    constructor(min, max, context, reduction = 0, title = 'Select value of X') {
        super();
        this.title = title;
        this.min = min;
        this.max = max;
        this.context = context;
        this.reduction = reduction;
    }

    continue() {
        if(this.min > this.max) {
            this.resolveCost(this.max);
            return;
        }

        let rangeArray = range(this.min, this.max + 1).reverse();

        let buttons = rangeArray.map(xValue => {
            return { text: xValue.toString(), method: 'resolveCost', arg: xValue };
        });

        this.context.game.promptWithMenu(this.context.player, this, {
            activePrompt: {
                menuTitle: this.title,
                buttons: buttons
            },
            source: this.context.source
        });
    }

    resolveCost(player, xValue) {
        this.context.xValue = xValue;
        this.context.grCost = Math.max(xValue - this.reduction, 0);

        return true;
    }
}

module.exports = XValuePrompt;
