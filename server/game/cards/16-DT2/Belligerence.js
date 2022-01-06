const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Belligerence extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Give Dude +1 bullets and influence',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a wanted dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', wanted: true },
                cardType: ['dude']
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to give {2} +1 bullets and +1 influence', context.player, this, context.target),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(1),
                        ability.effects.modifyInfluence(1)
                        
                    ]
                }), PhaseNames.Upkeep
                );
            }
        });

        this.action({
            title: 'Noon: Add bounty to unboot a Dude',
            playType: ['noon'],
            cost: [
                ability.costs.payGhostRock(1),
                ability.costs.raiseBounty(card =>
                    card.location === 'play area' &&
                    card.controller === this.owner &&
                    card.booted, 'unboot')
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} and adds bounty to {2} to unboot them', context.player, this, context.costs.raiseBounty),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.costs.raiseBounty }), context);
            }
        });
    }
}

Belligerence.code = '24223';

module.exports = Belligerence;
