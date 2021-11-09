const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ElksProtection extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Elk\'s Protection',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => !card.hasWeapon()
                },
                cardType: ['dude']
            },
            difficulty: 8,
            onSuccess: (context) => {
                this.applyElksEffect(context);
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Elk\'s Protection',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => !card.hasWeapon()
                },
                cardType: ['dude']
            },
            difficulty: 8,
            onSuccess: (context) => {
                this.applyElksEffect(context);
            },
            source: this
        });
    }

    applyElksEffect(context) {
        if(this.getPrintedStat('production')) {
            this.applyAbilityEffect(context.ability, ability => ({
                match: context.target,
                effect: ability.effects.modifyBullets(this.getPrintedStat('production'))
            }));
            this.game.addMessage('{0} uses {1} to give {2} {3} bullets', 
                context.player, this, context.target, this.getPrintedStat('production'));
        } else {
            this.game.addMessage('{0} uses {1}, but {2} does not receive any bullets', 
                context.player, this, context.target);
        }            
    }    
}

ElksProtection.code = '23046';

module.exports = ElksProtection;
