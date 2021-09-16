const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AbramsCrusaders extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.getType() === 'dude' &&
                card.hasKeyword('deputy') &&
                card.hasAttachmentWithKeywords(['melee', 'weapon']),
            effect: ability.effects.modifyBullets(1)
        });

        this.persistentEffect({
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.getType() === 'dude' &&
                card.hasKeyword('deputy') &&
                card.hasAttachmentWithKeywords(['miracle']),
            effect: ability.effects.modifyInfluence(1)
        });

        this.action({
            title: 'Noon: Abram\'s Crusaders',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current'
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to deputize {2} (gains Deputy keyword)', 
                    context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.addKeyword('deputy')
                }));
            }
        });
    }
}

AbramsCrusaders.code = '10002';

module.exports = AbramsCrusaders;
