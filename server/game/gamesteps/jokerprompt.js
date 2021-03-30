const BaseStep = require('./basestep.js');

class JokerPrompt extends BaseStep {
    constructor(game, jokerCard, callback) {
        super(game);
        this.jokerCard = jokerCard;
        this.callback = callback;
        this.selectedValue = 13;
    }

    continue() {
        let buttonsValue = [];
        for(let i = 1; i <= 13; i++) {
            buttonsValue.push({ text: i, method: 'selectJokerValue', arg: i });
        }
        this.game.promptWithMenu(this.jokerCard.owner, this, {
            activePrompt: {
                menuTitle: 'Select joker\'s value',
                buttons: buttonsValue
            },
            source: this.jokerCard
        });
    }

    selectJokerValue(player, arg) {
        this.selectedValue = arg;
        let buttonsSuit = ['Spades', 'Hearts', 'Clubs', 'Diamonds'].map(suit => {
            return { text: suit, method: 'selectJokerSuit', arg: suit};
        });
        this.game.promptWithMenu(player, this, {
            activePrompt: {
                menuTitle: 'Select joker\'s suit',
                buttons: buttonsSuit
            },
            source: this.jokerCard
        });
        return true;
    }

    selectJokerSuit(player, arg) {
        this.callback(this.jokerCard, this.selectedValue, arg);
        return true;
    }
}

module.exports = JokerPrompt;
