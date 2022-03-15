const DudeCard = require('../../dudecard.js');

class AncestorSpirit extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.game.onceConditional('onDudeLeftLocation', { condition: event => this.equals(event.card) }, 
            () => this.removeFromGame());
        this.game.onceConditional('onCardLeftPlay', { condition: event => this.equals(event.card) && event.targetLocation !== 'out of game' }, 
            () => this.removeFromGame());
        this.game.once('onRoundEnded', () => {
            if(this.location === 'play area') {
                this.removeFromGame();
            }
        });
    }

    removeFromGame() {
        this.owner.removeCardFromGame(this);
        this.game.addMessage('{0}\'s {1} has returned to the Hunting Grounds', this.controller, this);
    }
}

AncestorSpirit.code = '09041';

module.exports = AncestorSpirit;
