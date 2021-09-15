const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class AngelicaEspinosa extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Angelica Espinosa',
            playType: ['shootout:join'],
            condition: () => this.game.shootout &&
                this.game.shootout.shootoutLocation.isAdjacent(this.gamelocation),
            message: context => 
                this.game.addMessage('{0} uses {1} to join {1} to their posse from an adjacent location', context.player, this),
            gameAction: GameActions.joinPosse({ card: this, options: { moveToPosse: false }})
        });
    }
}

AngelicaEspinosa.code = '03007';

module.exports = AngelicaEspinosa;
