const SpellCard = require('../../spellcard.js');

class Malison extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Malison',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true 
                },
                cardType: ['dude']
            },
            difficulty: 9,
            onSuccess: (context) => {
                if(context.target.isStud()) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        condition: () => context.target.isParticipating(),
                        match: this.controller,
                        effect: ability.effects.modifyPosseStudBonus(1)
                    }));
                    this.game.addMessage('{0} uses {1} to give their posse +1 stud bonus', context.player, this);
                } else {
                    this.applyAbilityEffect(context.ability, ability => ({
                        condition: () => context.target.isParticipating(),
                        match: this.controller,
                        effect: ability.effects.modifyPosseDrawBonus(1)
                    }));
                    this.game.addMessage('{0} uses {1} to give their posse +1 draw bonus', context.player, this);            
                }
                let eventHandler = () => {
                    if(this.parent) {
                        this.parent.modifyInfluence(1);
                        this.game.addMessage('{0} gains 1 influence on {1} thanks to {2}',
                            this.controller, this.parent, this);
                    }
                };
                this.game.onceConditional('onCardDiscarded', {
                    until: 'onShootoutPhaseFinished',
                    condition: event => event.card.equals(context.target) 
                }, eventHandler);
                this.game.onceConditional('onCardAced', { 
                    until: 'onShootoutPhaseFinished',
                    condition: event => event.card.equals(context.target) 
                }, eventHandler);
            },
            source: this
        });
    }
}

Malison.code = '21050';

module.exports = Malison;
