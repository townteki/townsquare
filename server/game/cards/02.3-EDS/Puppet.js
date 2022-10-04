const SpellCard = require('../../spellcard.js');

class Puppet extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Puppet',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude']
            },
            difficulty: context => context.target.getGrit(context),
            message: context => 
                this.game.addMessage('{0} uses {1} to take control of {2}', context.player, this, context.target),
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.takeControl(context.player)
                }));
            },
            source: this
        });
    }
}

Puppet.code = '04017';

module.exports = Puppet;
