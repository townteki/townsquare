const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MichaelTheBadgerDodge extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => this.hasAttachmentWithKeywords(['melee', 'weapon']), 
            match: this,
            effect: [
                ability.effects.setAsStud()
            ]
        });
        this.action({
            title: 'Michael "The Badger" Dodge',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                // Not strictly a cost, but needed so we can reference the result in the 
                // action handler.
                ability.costs.pull()
            ],
            target: {
                activePromptTitle: 'Choose an opposing Dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    inOpposingPosse: true, 
                    controller: 'opponent',
                    condition: card => !card.booted
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            message: context => this.game.addMessage('{0} uses {1} to boot an opposing dude', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    const opposingUnbootedDudes = this.unbootedDudeCount(context.player.getOpponent());
                    const unbootedDudes = this.unbootedDudeCount(context.player);
                    if(opposingUnbootedDudes > unbootedDudes) {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: this,
                            effect: [
                                ability.effects.modifyBullets(-3)
                            ]
                        }));
                        this.game.addMessage('{0}\'s bullets are lowered because there are more opposing unbooted dudes', this);
                    }

                    if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                        this.game.addMessage('{0} uses {1} but fails to lower the bullets of {2}', context.player, this, context.target);
                    } else {
                        context.target.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: [
                                ability.effects.modifyBullets(-3)
                            ]
                        }));
                        this.game.addMessage('{0} uses {1} to lower the bullets of {2}', context.player, this, context.target);
                    }
                });
            }
        });
    }

    unbootedDudeCount(player) {
        return this.game.shootout.getPosseByPlayer(player).getDudes(dude => !dude.booted).length;
    }
}

MichaelTheBadgerDodge.code = '10006';

module.exports = MichaelTheBadgerDodge;
