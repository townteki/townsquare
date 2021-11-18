const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Klah extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Klah',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => card.parent === this &&
                    card.hasKeyword('sidekick'))
            ],
            target: {
                activePromptTitle: 'Choose your dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current',
                    participating: true,
                    condition: card => card.hasAttachmentWithKeywords(['sidekick'])
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} +1 bullets', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(1)
                }));
            }
        });
    }
}

Klah.code = '21016';

module.exports = Klah;
