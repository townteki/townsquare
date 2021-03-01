const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class ShaneGravesSecurity extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shane & Graves Security',
            playType: ['shootout:join'],
            cost: ability.costs.bootSelf(),
            condition: () => this.game.shootout &&
                this.game.getShootoutLocationCard().getType() === 'deed' &&
                (this.game.getShootoutLocationCard() === this ||
                this.game.shootout.shootoutLocation.isAdjacent(this.uuid)),
            handler: context => {
                // nedalo gunslingera ako moznost pre shootera .. PRECO??
                let token = context.player.placeToken('Gunslinger', this.game.shootout.shootoutLocation.uuid);
                this.game.resolveGameAction(GameActions.joinPosse({ card: token, moveToPosse: false }), context);
                this.game.addMessage('{0} uses {1} to call a {2} into the shootout.', context.player, this, token);
            }
        });
    }
}

ShaneGravesSecurity.code = '06010';

module.exports = ShaneGravesSecurity;
