const DudeCard = require('../../dudecard.js');

class NatureSpirit extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.game.onceConditional('onDudeLeftPosse', { condition: event => event.card === this }, () => this.removeFromGame());
        this.game.once('onShootoutPhaseFinished', () => {
            if(this.location === 'play area') {
                this.removeFromGame();
            }
        });
        this.game.once('onCardCallOutFinished', () => {
            if(this.location === 'play area') {
                this.removeFromGame();
            }
        });
    }

    removeFromGame() {
        this.owner.removeCardFromGame(this);
        this.game.addMessage('{0}\'s {1} has returned to the Hunting Grounds.', this.controller, this);
    }
}

NatureSpirit.code = '09042';

module.exports = NatureSpirit;
