const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SuppressingFire extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Make dude a draw',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    booted: true, 
                    participating: true 
                },
                cardType: ['dude'],
                gameAction: 'setAsDraw'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to make {2} a draw', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setAsDraw()
                    ]
                }));
            }
        });

        this.action({
            title: 'Make dude a stud',
            playType: ['shootout'],
            cost: ability.costs.boot(card => card.controller.equals(this.controller) &&
                card.isParticipating() &&
                card.getType() === 'dude' || card.hasKeyword('Weapon')),
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to make {3} a stud', 
                    context.player, this, context.costs.boot, context.costs.boot.getType() === 'dude' ? context.costs.boot : context.costs.boot.parent),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.costs.boot.getType() === 'dude' ? context.costs.boot : context.costs.boot.parent,
                    effect: [
                        ability.effects.setAsStud()
                    ]
                }));
            }
        });
    }
}

SuppressingFire.code = '25055';

module.exports = SuppressingFire;
