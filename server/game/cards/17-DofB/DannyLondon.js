const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DannyLondon extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            // Add always-on condition if effect is state dependent so it will be 
            // rechecked after every event
            condition: () => true,
            match: card => card.location === 'play area' && card.getType() === 'dude' && 
                card.hasKeyword('abomination') && card.isNearby(this.gamelocation),
            effect: [
                ability.effects.doesNotGetBountyOnJoin(this)
            ]
        });
        this.action({
            title: 'Change bullets',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select your abomination',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    keyword: 'abomination',
                    participating: true
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to set his bullet type and bullet count based on {2} ({3}, {4})', 
                    context.player, this, context.target, context.target.isStud() ? 'stud' : 'draw', context.target.bullets),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        context.target.isStud() ? ability.effects.setAsStud() : ability.effects.setAsDraw(),
                        ability.effects.modifyBullets(context.target.bullets - this.bullets)
                    ]
                }));
            }
        });
    }
}

DannyLondon.code = '25012';

module.exports = DannyLondon;
