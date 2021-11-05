const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TakinCover extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Takin\' Cover',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} -1 bullets and they cannot be chosen as casualty ' + 
                    'unless {0} loses this shootout round by 3 or more ranks', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: context.target,
                    effect: ability.effects.cannotBeChosenAsCasualty(this,
                        card => card.controller.getOpponent().getTotalRank() - card.controller.getTotalRank() < 3)
                }));                
            }
        });
    }
}

TakinCover.code = '22053';

module.exports = TakinCover;
