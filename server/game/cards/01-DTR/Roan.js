const GoodsCard = require('../../goodscard.js');

class Roan extends GoodsCard {
    setupCardAbilities(ability) {
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
            handler: () => {
                this.lastingEffect(ability => ({
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

Roan.code = '01088';

module.exports = Roan;
