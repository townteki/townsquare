const { LeaderPosse } = require('../../Constants/ShootoutStatuses.js');
const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class GhostlyCommunion extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout:',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            condition: () => this.game.shootout &&
                (this.game.shootout.shootoutLocation.hasKeyword('holy ground') || this.game.shootout.shootoutLocation.isAdjacent(this.game.location.hasKeyword('holy ground'))),
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }), context);
                this.parent.setAsStud();
                this.game.addMessage('{0} uses {1} to move {2} and have them join the posse and make them a stud', context.player, this, this.parent );
            },
            source: this
        });
    }
}

GhostlyCommunion.code = '17017';

module.exports = GhostlyCommunion;
