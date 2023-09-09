const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class StanFredricks extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Move Bounty',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                if(this.isWanted()) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select a dude to move bounty to',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller !== this.controller &&
                            card.isParticipating(),
                        cardType: 'dude',
                        gameAction: 'addBounty',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.moveBounty({ from: this, to: card }), context);
                            this.game.addMessage('{0} boots {1} to move 1 bounty from him to {2}',
                                this.controller, this, card);
                            return true;
                        },
                        source: this
                    });
                }
                this.game.shootout.sendHome(this, context, {}, 
                    () => this.game.addMessage('{0} uses {1} to send him home booted', context.player, this));
            }
        });
    }
}

StanFredricks.code = '25018';

module.exports = StanFredricks;
