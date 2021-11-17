const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MasonicAugment extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon/Shootout: Masonic Augment',
            playType: ['noon'],
            cost: ability.costs.discardFromPlay(card => card.getType() === 'spell' &&
                card.controller === this.controller &&
                card.owner === this.controller),
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => !this.game.shootout ||
                        card.isParticipating() 
                },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(1),
                        ability.effects.modifyInfluence(1)
                    ]
                }));
                if(context.costs.savedCardsInfo.length && !context.costs.savedCardsInfo[0].booted) {
                    const spellCost = context.costs.discardFromPlay.getPrintedStat('cost');
                    context.player.modifyGhostRock(spellCost);
                    this.game.addMessage('{0} uses {1} and discards {2} to give {3} +1 bullets and +1 influence and gains {4} GR', 
                        context.player, this, context.costs.discardFromPlay, context.target, spellCost);
                } else {
                    this.game.addMessage('{0} uses {1} and discards {2} to give {3} +1 bullets and +1 influence', 
                        context.player, this, context.costs.discardFromPlay, context.target);                    
                }
            }
        });
    }
}

MasonicAugment.code = '23054';

module.exports = MasonicAugment;
