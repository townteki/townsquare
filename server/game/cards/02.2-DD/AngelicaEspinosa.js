const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class AngelicaEspinosa extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Angelica Espinosa',
            playType: ['shootout:join'],
            actionContext: { card: this, gameAction: 'joinPosse' },
            condition: () => this.game.getShootoutGameLocation().isAdjacent(this.gamelocation),
            message: context => 
                this.game.addMessage('{0} uses {1} to join {1} to their posse from an adjacent location', context.player, this),
            gameAction: GameActions.joinPosse({ card: this, options: { moveToPosse: false }})
        });
    }
}

AngelicaEspinosa.code = '03007';

module.exports = AngelicaEspinosa;
