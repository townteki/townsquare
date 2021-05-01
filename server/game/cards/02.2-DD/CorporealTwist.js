const SpellCard = require('../../spellcard.js');

class CorporealTwist extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Corporeal Twist',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            difficulty: 4,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-1),
                        ability.effects.modifyValue(-2)
                    ]
                }));
                let eventHandler = () => {
                    this.parent.modifyControl(1);
                    this.game.addMessage('{0} gains control point on {1} thanks to {2}',
                        this.controller, this.parent, this);
                };
                this.game.onceConditional('onCardDiscarded', { condition: event => event.card === context.target }, eventHandler);
                this.game.onceConditional('onCardAced', { condition: event => event.card === context.target }, eventHandler);
                this.game.once('onShootoutPhaseFinished', () => {
                    this.game.removeListener('onCardDiscarded', eventHandler);
                    this.game.removeListener('onCardAced', eventHandler);
                });
                this.game.addMessage('{0} uses {1} on {2}, who gets -1 bullets and -2 value',
                    context.player, this, context.target);
            },
            source: this
        });
    }
}

CorporealTwist.code = '03017';

module.exports = CorporealTwist;
