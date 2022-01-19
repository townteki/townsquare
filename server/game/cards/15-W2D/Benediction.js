const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Benediction extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Benediction',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose another dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card !== this.parent &&
                        card.isNearby(this.gamelocation) 
                },
                cardType: ['dude']
            },
            difficulty: 6,
            onSuccess: (context) => {
                if(!context.target.isSkilled()) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.modifyBullets(1)
                    }));
                    this.game.addMessage('{0} uses {1} to give {2} +1 bullets', context.player, this, context.target);
                } else {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: context.target.getSkills().map(skillname => 
                            ability.effects.modifySkillRating(skillname, 2))
                    }));
                    this.game.addMessage('{0} uses {1} to give {2} +2 to all of their skills', 
                        context.player, this, context.target);                                                       
                }
            },
            source: this
        });
    }
}

Benediction.code = '23044';

module.exports = Benediction;
