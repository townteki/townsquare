const PlayingTypes = require('../../Constants/PlayingTypes.js');
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
            this.roundUpPosse(player);
        }
    }

    handleSolo() {
        this.roundUpPosse(this.game.automaton);
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
        if(player.hand.some(card => card.getType() === 'deed' && !card.isCore())) {
            return 'Only Core deeds can be in the starting gang';
        }
        const startingCoreDeeds = player.hand.filter(card => card.isCore());
        if(startingCoreDeeds.length > 1) {
            return `Too many Core deeds (${startingCoreDeeds.length}) in starting gang`;
        }
        if(startingCoreDeeds.length && !['NONE', player.getFaction()].includes(startingCoreDeeds[0].getCoreFaction())) {
            return `Core deed faction (${startingCoreDeeds[0].getCoreFaction()}) does not match player faction`;
        }
        const startingGrifterSize = player.hand.reduce((size, card) => {
            if(card.getType() === 'dude' && card.hasKeyword('grifter')) {
                return size + card.startingSize;
            }
            return size;    
        }, 0);
        if(startingGrifterSize > player.availableGrifterActions) {
            return `Too many Grifters (${startingGrifterSize}) in starting gang`;
        }
        const posseCost = player.hand.reduce((aggregator, card) => {
            let reducedCost = player.getReducedCost(PlayingTypes.Setup, card, player.createContext());
            aggregator + reducedCost;
        }, 0);
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

    roundUpPosse(player) {
        player.startPosse();
        this.game.addMessage('{0} has rounded up their starting posse', player);
    }
}

module.exports = StartingPossePrompt;
