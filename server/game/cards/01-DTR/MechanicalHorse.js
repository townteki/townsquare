const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class MechanicalHorse extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Move dude',
            playType: ['noon'],
            cost: ability.costs.payGhostRock(2),
            repeatable: true,
            target: { cardType: 'location' },
            actionContext: { card: this.parent, gameAction: 'moveDude '},
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, this.parent, context.target.title),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context);
            }
        });
        this.reaction({
            title: 'React: Prevent booting',
            when: {
                onDudeJoiningPosse: event => 
                    event.card === this.parent && 
                    this.parent.requirementsToJoinPosse().needToBoot
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent {2} from booting when joining posse', context.player, this, this.parent),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPossesGathered: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.parent,
                    effect: ability.effects.canJoinWithoutBooting()
                }));
            }
        });
    }
}

MechanicalHorse.code = '01094';

module.exports = MechanicalHorse;
