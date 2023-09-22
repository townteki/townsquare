const { BountyType } = require('../../Constants/index.js');
const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DispatchOffice extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Modify bounty',
            when: {
                onCardBountyAdded: event => event.reason === BountyType.breaking
            },
            cost: [ability.costs.bootSelf()],
            handler: context => {
                if(context.event.card.bounty === 0) {
                    this.game.resolveGameAction(GameActions.addBounty({ card: context.event.card }), context);
                } else {
                    this.abilityContext = context;
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Raise or lower bounty (by 1)?',
                            buttons: [
                                { 
                                    text: 'Raise by 1', 
                                    method: 'raise',
                                    disabled: !this.abilityContext.event.card.allowGameAction('increaseBounty', context)
                                },
                                { 
                                    text: 'Lower by 1', 
                                    method: 'lower',
                                    disabled: !this.abilityContext.event.card.allowGameAction('decreaseBounty', context)
                                }
                            ]
                        },
                        source: this
                    });                    
                }
            }
        });
    }

    raise(player) {
        this.modifyBountyAbility(player, 1);
        return true;
    }

    lower(player) {
        this.modifyBountyAbility(player, -1);
        return true;
    }

    modifyBountyAbility(player, amount) {
        if(amount < 0) {
            this.game.resolveGameAction(GameActions.removeBounty({ 
                card: this.abilityContext.event.card 
            }), this.abilityContext)
                .thenExecute(() => this.game.addMessage('{0} uses {1} to decrease {2}\'s bounty by 1', 
                    player, this, this.abilityContext.event.card));
        } else {
            this.game.resolveGameAction(GameActions.addBounty({ 
                card: this.abilityContext.event.card 
            }), this.abilityContext)
                .thenExecute(() => this.game.addMessage('{0} uses {1} to increase {2}\'s bounty by 1', 
                    player, this, this.abilityContext.event.card));              
        }
    }    
}

DispatchOffice.code = '25033';

module.exports = DispatchOffice;
