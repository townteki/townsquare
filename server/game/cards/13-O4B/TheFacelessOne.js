const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheFacelessOne extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: The Faceless One',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                const bulletBonus = context.target.bullets > 4 ? 4 : context.target.bullets;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(bulletBonus)
                }));
                this.game.addMessage('{0} uses {1} to increase its bullets by {2}\'s bullet rating ({3})', 
                    context.player, this, context.target, bulletBonus);
                if(context.target.getGrit() >= 11) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.setMaxBullets(4)
                    }));
                    this.game.addMessage('{0} uses {1} to set maximum bullet rating of {2} to 4', 
                        context.player, this, context.target);
                }
            }
        });
    }
}

TheFacelessOne.code = '21019';

module.exports = TheFacelessOne;
