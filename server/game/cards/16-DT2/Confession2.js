const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Confession2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Add Bounty to a Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            target: {
                activePromptTitle: 'Select a dude to add bounty to',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: (card, context) =>
                        card.gamelocation === this.gamelocation || 
                        (card.isAdjacent(this.gamelocation) && 
                        !this.parent.booted && this.parent.canBeBooted(context))
                },
                cardType: ['dude'],
                gameAction: 'addBounty'
            },
            onSuccess: (context) => {
                if(context.target.gamelocation !== this.gamelocation) {
                    this.game.resolveGameAction(GameActions.bootCard({ card: this.parent }), context).thenExecute(() => {
                        this.applyConfessionEffect(context, true);
                    });
                } else {
                    this.applyConfessionEffect(context, false);
                }
            },
            source: this
        });

        this.spellAction({
            title: 'Noon: Transfer Bounty to Stash',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            target: {
                activePromptTitle: 'Select a dude to take bounty from',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: card =>
                        card.isNearby(this.gamelocation) &&
                        card.isWanted()
                },
                cardType: ['dude'],
                gameAction: 'removeBounty'
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.removeBounty({
                    card: context.target, amount: 1
                })).thenExecute(() => {
                    context.player.modifyGhostRock(1);
                    this.game.addMessage('{0} uses {1} to take 1 bounty from {2} and add it to their stash', context.player, this, context.target);
                });
            },
            source: this
        });
    }

    applyConfessionEffect(context, requireBoot) {
        this.game.resolveGameAction(GameActions.addBounty({
            card: context.target, amount: 1
        })).thenExecute(() => {
            if(requireBoot) {
                this.game.addMessage('{0} uses {1} and boots {2} to add 1 bounty to {3}', 
                    context.player, this, this.parent, context.target);
            }
            this.game.addMessage('{0} uses {1} to add 1 bounty to {2}', 
                context.player, this, context.target);
        });
    }
}

Confession2.code = '24194';

module.exports = Confession2;
