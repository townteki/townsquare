const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GhostDancers extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.canAttachTotems(),
                ability.effects.addAttachmentLimit({ keyword: 'totem', limit: 1})
            ]
        });

        this.persistentEffect({
            targetController: 'any',
            condition: () => !this.isAtDeed(),
            match: card => card.parent && card.parent.equals(this) && card.isTotem(),
            effect: ability.effects.totemIsUnplanted()
        });

        this.action({
            title: 'Ghost Dancers',
            playType: ['noon'],
            condition: () => this.location === 'play area' &&
                this.isInControlledLocation() &&
                this.getGameLocation() && this.getGameLocation().getDudes(dude => dude.hasKeyword('shaman') && !dude.booted).length,
            target: {
                activePromptTitle: 'Choose Totem to attach',
                cardCondition: { location: 'hand', controller: 'current', condition: card => card.isTotem() },
                cardType: ['spell']
            },
            handler: context => {
                context.player.attach(context.target, this, 'ability', 
                    () => this.game.addMessage('{0} uses {1} to attach {2} to them', context.player, this, context.target));
            }
        });
    }
}

GhostDancers.code = '25013';

module.exports = GhostDancers;
