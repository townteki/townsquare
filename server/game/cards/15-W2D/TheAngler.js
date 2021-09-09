const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class TheAngler extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Call Out',
            playType: 'noon',
            target: {
                location: 'play area',
                cardCondition: card => this.isInSameLocation(card) && card.value === this.value && card.getType() === 'dude' && card.controller !== this.controller,
                gameAction: 'callout'
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to call out {2}', this.controller, this, context.target);
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ caller: this, callee: context.target }), context);
            }
        });

        this.action({
            title: 'Change Value',
            playType: 'noon',
            cost: ability.costs.discardFromHand(),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setValue(context.costs.discardFromHand.value)
                }));                
                this.game.addMessage('{0} uses {1} to change {1}\'s value to {2}', context.player, this, context.costs.discardFromHand.value);
            }
        });
    }
}

TheAngler.code = '23012';

module.exports = TheAngler;
