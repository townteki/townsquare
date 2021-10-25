const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AdelaideRose extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Adelaide Rose',
            playType: ['shootout'],
            cost: ability.costs.boot(card => card.parent === this &&
                card.hasKeyword('gadget')),
            target: {
                activePromptTitle: 'Choose opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: 'decreaseBullets'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to give {3} -1 bullets', 
                    context.player, this, context.costs.boot, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
                if(context.costs.boot.hasKeyword('experimental')) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose your dude',
                        cardCondition: card => card.isParticipating() &&
                            card.controller === context.player,
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: card,
                                effect: ability.effects.modifyBullets(1)
                            }));
                            this.game.addMessage('{0} uses {1} to give {2} +1 bullets', player, this, card);                          
                            return true;
                        },
                        source: this
                    });
                }
            }
        });
    }
}

AdelaideRose.code = '21029';

module.exports = AdelaideRose;
