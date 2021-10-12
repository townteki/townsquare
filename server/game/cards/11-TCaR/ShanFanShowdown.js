const ActionCard = require('../../actioncard');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ShanFanShowdown extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Shan Fan Showdown!',
            when: {
                onPossesFormed: () => true
            },
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.hasAttachmentWithKeywords(['melee', 'weapon']) 
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot {2} and set them as stud. Hand ranks and casualties cannot be modified this shootout', 
                    context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.getPlayers(),
                    effect: [
                        ability.effects.cannotModifyHandRanks(this, context => context.ability && 
                            ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context))),
                        ability.effects.cannotIncreaseCasualties(this, context => context.ability && 
                            ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context))),
                        ability.effects.cannotDecreaseCasualties(this, context => context.ability && 
                            ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed(context)))                                                        
                    ]
                }));
            }
        });
    }
}

ShanFanShowdown.code = '19044';

module.exports = ShanFanShowdown;
