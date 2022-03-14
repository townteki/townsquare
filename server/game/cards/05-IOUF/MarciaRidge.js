const DudeCard = require('../../dudecard.js');

class MarciaRidge extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.isInTownSquare() && this.isPlayerControllingTownSquare(),
            match: card => card.getType() === 'deed' && this.game.townsquare.isAdjacent(card.gamelocation),
            effect: ability.effects.canUseControllerAbilities(this, player => player.equals(this.controller))
        });
    }

    isPlayerControllingTownSquare() {
        let opponent = this.controller.getOpponent();
        let playerTSDudes = this.game.townsquare.getDudes().filter(dude => dude && dude.controller.equals(this.controller));
        let opponentTSDudes = this.game.townsquare.getDudes().filter(dude => dude && dude.controller.equals(opponent));
        return playerTSDudes.reduce((memo, dude) => memo + dude.influence, 0) > opponentTSDudes.reduce((memo, dude) => memo + dude.influence, 0);
    }
}

MarciaRidge.code = '09018';

module.exports = MarciaRidge;
