const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class ShieldOfFaith2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shield of Faith',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    condition: () => true,
                    match: card => card.getType() === 'dude' && card.isParticipating(),
                    effect: [
                        ability.effects.cannotBeAced('any', context => this.abilityProtectCondition(context)),
                        ability.effects.cannotBeDiscarded('any', context => this.abilityProtectCondition(context))
                    ]
                })); 
                this.game.addMessage('{0} uses {1} to prevent Dudes to be aced or discarded during this shootout, ' +
                    'except as a casualty for losing the round or due to their owner\'s card abilities or traits', context.player, this, context.target);                
                this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                    player: context.player, 
                    amount: 1
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to reduce their casualties this round by 1', context.player, this);
                });                     
            },
            source: this
        });
    }

    abilityProtectCondition(context) {
        if(!context) {
            return false;
        }
        if(context.ability && context.ability.playTypePlayed(context) === 'cheatin resolution') {
            return false;
        }
        return !context.isCasualty && context.player !== context.card.controller;
    }
}

ShieldOfFaith2.code = '24196';

module.exports = ShieldOfFaith2;
