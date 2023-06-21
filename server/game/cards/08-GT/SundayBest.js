const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');
const PhaseNames = require('../../Constants/PhaseNames.js');

class SundayBest extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.game.currentPhase === PhaseNames.Upkeep,
            effect: ability.effects.modifyInfluence(3)
        });
        this.reaction({
            when: {
                onPhaseStarted: event => event.phase === PhaseNames.Upkeep &&
                    this.parent && this.parent.getType() === 'dude'
            },
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: `Select location for ${this.parent?this.parent.title:"Sunday Best\'s wearer"} to run to`,
                cardCondition: {
                    location: 'play area',
                    condition: card => card.isAdjacent(this.gameLocation)
                },
                cardType: 'location'
            },
            message: context => this.game.addMessage('{0} uses {1} to move {2} to {3}',
                context.player, this, this.parent, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({
                    card: this.parent,
                    targetUuid: context.target.uuid
                }), context);
            }
        });
    }
}

SundayBest.code = '14023';

module.exports = SundayBest;
