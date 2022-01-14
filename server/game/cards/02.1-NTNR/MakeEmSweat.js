const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class MakeEmSweat extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Reduce a dude\'s bullets',
            playType: 'shootout',
            cost: ability.costs.boot(card =>
                card.getType() === 'dude' &&
                card.isParticipating() && card.controller === this.controller &&
                    !card.booted),
            target: {
                activePromptTitle: 'Choose dude to reduce bullets',
                cardCondition: { location: 'play area', participating: true },
                cardType: 'dude'
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-context.costs.boot.bullets)
                }));
                if(context.target.bullets <= 0 && !context.target.booted) {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} and boots {2} to reduce {3}\'s bullets by {4} and boot {3}', context.player, this, context.costs.boot, context.target, context.costs.boot.bullets);
                    });
                } else {
                    this.game.addMessage('{0} uses {1} and boots {2} to reduce {3}\'s bullets by {4}', context.player, this, context.costs.boot, context.target, context.costs.boot.bullets);
                }
            }
        });
    }
}

MakeEmSweat.code = '02018';

module.exports = MakeEmSweat;
