const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BoltsODoom extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout: Bolts o\' Doom',
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
            difficulty: 7,
            onSuccess: (context) => {
                if(this.parent.influence > 0) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.modifyBullets(-this.parent.influence)
                    }));
                }
                if(context.target.bullets === 0) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this.parent,
                        effect: ability.effects.modifyBullets(1)
                    }));
                }
            },
            source: this
        });
    }
}

BoltsODoom.code = '22044';

module.exports = BoltsODoom;
