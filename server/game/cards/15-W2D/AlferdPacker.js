const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AlferdPacker extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Alferd Packer',
            playType: ['shootout'],
            condition: () => this.isParticipating(),
            triggeringPlayer: 'any',
            repeatable: true,
            cost: ability.costs.payGhostRock(3),
            message: context => 
                this.game.addMessage('{0} uses {1} and pays 3 GR to have him join their posse', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.takeControl(context.player)
                }));                
            }
        });
    }
}

AlferdPacker.code = '23025';

module.exports = AlferdPacker;
