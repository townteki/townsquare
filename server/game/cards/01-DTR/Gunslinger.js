const DudeCard = require('../../dudecard.js');

class Gunslinger extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.game.onceConditional('onDudeLeftPosse', { condition: event => event.card === this }, () => this.removeFromGame());
        this.game.once('onShootoutPhaseFinished', () => {
            if(this.location === 'play area') {
                this.removeFromGame();
            }
        });
    }

    removeFromGame() {
        this.owner.removeCardFromGame(this);
        this.game.addMessage('{0}\'s {1} has left the country (game).', this.controller, this);
    }
}

Gunslinger.code = '01146';

module.exports = Gunslinger;
