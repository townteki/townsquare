const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class MechanicalHorse extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Mechanical Horse',
            playType: ['noon'],
            cost: ability.costs.payGhostRock(2),
            repeatable: true,
            target: { cardType: 'location' },
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, this.parent, context.target.title),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context);
            }
        });
        this.reaction({
            when: {
                onDudeJoinedPosse: event => 
                    event.card === this.parent && 
                    this.parent.requirementsToJoinPosse().needToBoot
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent {2} from booting when joining posse', context.player, this, this.parent),
            handler: context => {
                context.game.shootout.addMoveOptions(this.parent, { needToBoot: false });
            }
        });
    }
}

MechanicalHorse.code = '01094';

module.exports = MechanicalHorse;
