const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ElksProtection extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.attachmentRestriction({ type: 'deed'});
        
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
                    participating: true,
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
        const prodValue = this.locationCard ? this.locationCard.getPrintedStat('production') : 0;
        if(prodValue) {
            this.applyAbilityEffect(context.ability, ability => ({
                match: context.target,
                effect: ability.effects.modifyBullets(prodValue)
            }));
            this.game.addMessage('{0} uses {1} to give {2} {3} bullets', 
                context.player, this, context.target, prodValue);
        } else {
            this.game.addMessage('{0} uses {1}, but {2} does not receive any bullets', 
                context.player, this, context.target);
        }            
    }    
}

ElksProtection.code = '23046';

module.exports = ElksProtection;
