const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MichaelTheBadgerDodge extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => true,
            match: this && this.hasAttachmentWithKeywords(['melee', 'weapon']),
            effect: [
                ability.effects.setAsStud()
            ]
        });
        this.action({
            title: 'Michael "The Badger" Dodge',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                // Strictly speaking, I don't think this is actually a cost but we need
                // a pulled card to resolve the effect below.
                ability.costs.pull()
            ],
            target: {
                activePromptTitle: 'Choose an opposing Dude',
                choosingPlayer: 'current',
                cardCondition: { inOpposingPosse: true, condition: card => !card.booted },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to decrease the bullets of an opposing dude', context.player, this),
            handler: context => {
                context.target.bootSelf();
                const opposingUnbootedDudes = this.unbootedDudeCount(context.player.getOpponent());
                // this.game.shootout.getPosseByPlayer(context.player.getOpponent()).getDudes(dude => !dude.booted).length;
                const unbootedDudes = this.unbootedDudeCount(context.player);
                // this.game.shootout.getPosseByPlayer(context.player).getDudes(dude => !dude.booted).length;
                if(opposingUnbootedDudes > unbootedDudes) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: [
                            ability.effects.modifyBullets(-3)
                        ]
                    }));
                }
                if(context.pull.pulledSuit.toLowerCase() !== 'clubs') {
                    context.target.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: [
                            ability.effects.modifyBullets(-3)
                        ]
                    }));
                }
            }
        });
    }

    unbootedDudeCount(player) {
        return this.game.shootout.getPosseByPlayer(player).getDudes(dude => !dude.booted).length;
    }
}

MichaelTheBadgerDodge.code = '10006';

module.exports = MichaelTheBadgerDodge;
