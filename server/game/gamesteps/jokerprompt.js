const BaseStep = require('./basestep.js');

class JokerPrompt extends BaseStep {
    constructor(game, jokerCard, callback) {
        super(game);
        this.jokerCard = jokerCard;
        this.callback = callback;
        this.selectedValue = 13;
    }

    continue() {
        this.game.promptForValue(this.jokerCard.owner, 'Select joker\'s value', 'selectJokerValue', this, this.jokerCard);
    }

    selectJokerValue(player, arg) {
        this.selectedValue = arg;
        this.game.promptForSuit(player, 'Select joker\'s suit', 'selectJokerSuit', this, this.jokerCard);
        return true;
    }

    selectJokerSuit(player, arg) {
        this.callback(this.jokerCard, this.selectedValue, arg);
        return true;
    }
}

module.exports = JokerPrompt;
