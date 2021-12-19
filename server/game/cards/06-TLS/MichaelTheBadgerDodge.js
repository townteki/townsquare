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
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing Dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    participating: true, 
                    controller: 'opponent',
                    condition: card => !card.booted
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            message: context => this.game.addMessage('{0} uses {1} to boot an opposing dude', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                // TODO this calculation appears incorrect, it does not take into account the dude that was just booted
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
                    this.game.addMessage('{0}\'s bullets are lowered because there are more opposing unbooted dudes', this);
                }

                context.player.handlePull({
                    successCondition: pulledValue => pulledValue.suit !== 'clubs',
                    successHandler: () => {
                        context.target.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: [
                                ability.effects.modifyBullets(-3)
                            ]
                        }));
                        this.game.addMessage('{0} uses {1} to lower the bullets of {2}', context.player, this, context.target);
                    },
                    failHandler: () => {
                        this.game.addMessage('{0} uses {1} but fails to lower the bullets of {2}', context.player, this, context.target);
                    },
                    source: this
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
