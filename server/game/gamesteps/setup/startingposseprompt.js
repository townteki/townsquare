const AllPlayerPrompt = require('../allplayerprompt.js');

class StartingPossePrompt extends AllPlayerPrompt {
    constructor(game) {
        super(game);
        this.validPosse = false;
    }

    completionCondition(player) {
        return player.posse;
    }

    activePrompt(player) {
        const errMessage = this.validateStartingPosse(player);
        const promptInfo = {};
        if(errMessage) {
            this.validPosse = false;
            promptInfo.type = 'danger';
            promptInfo.message = errMessage;
        } else {
            this.validPosse = true;
        }
        return {
            menuTitle: 'Select Starting Posse',
            promptInfo,
            buttons: [
                { arg: 'selected', text: 'Done' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to select starting posse' };
    }

    onMenuCommand(player) {
        if(this.validPosse) {
            player.startPosse();
            this.game.addMessage('{0} has rounded up their starting posse', player);
        }
    }

    validateStartingPosse(player) {
        const startingDudesSize = player.hand.reduce((size, card) => {
            if(card.getType() === 'dude') {
                return size + card.startingSize;
            }
            return size;
        }, 0);
        if(startingDudesSize > 5) {
            return `Too many cards (${startingDudesSize}) in starting gang`;
        }
        if(player.hand.some(card => card.getType() === 'deed' && !card.hasKeyword('core'))) {
            return 'Only Core deeds can be in the starting gang';
        }
        const startingCoreSize = player.hand.reduce((size, card) => {
            if(card.getType() === 'deed' && card.hasKeyword('core')) {
                return size + card.startingSize;
            }
            return size;
        }, 0);
        if(startingCoreSize > 1) {
            return `Too many Core deeds (${startingCoreSize}) in starting gang`;
        }
        const posseCost = player.hand.reduce((aggregator, card) => aggregator + card.cost, 0);
        if(posseCost > player.ghostrock) {
            return `Starting gang cost (${posseCost}) is greater than starting GR (${player.ghostrock})`;
        }
        for(let startingCard of player.hand) {
            if(!startingCard.startingCondition()) {
                return `Card ${startingCard.title} does not match starting condition`;
            }
            if(player.hand.find(card => card.code === startingCard.code && card !== startingCard && card.isUnique())) {
                return 'Starting multiple copies of unique card';
            }
        }
    }
}

module.exports = StartingPossePrompt;
