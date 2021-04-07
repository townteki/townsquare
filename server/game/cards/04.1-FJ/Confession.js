const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Confession extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Add Bounty to a Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            condition: () => !this.parent.booted,
            target: {
                activePromptTitle: 'Select a dude to add bounty to',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: card =>
                        card.gamelocation === this.gamelocation || 
                        card.getGameLocation().isAdjacent(this.gamelocation)
                },
                cardType: ['dude'],
                gameAction: 'addBounty'
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this.parent }), context).thenExecute(() => {
                    this.game.resolveGameAction(GameActions.addBounty({
                        card: context.target, amount: this.parent.getSkillRating('blessed')
                    })).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to boot {2} and add bounty to {3}', context.player, this, this.parent, context.target);
                    });
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Noon: Remove Bounty from a Dude and add to Stash',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            target: {
                activePromptTitle: 'Select a dude to take bounty from',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: card =>
                        (card.gamelocation === this.gamelocation || 
                        card.getGameLocation().isAdjacent(this.gamelocation)) &&
                        card.isWanted()
                },
                cardType: ['dude'],
                gameAction: 'removeBounty'
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.removeBounty({
                    card: context.target, amount: 1
                })).thenExecute(() => {
                    context.player.modifyGhostRock(1).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to take 1 bounty from {2} and add it to their stash', context.player, this, context.target);
                    });
                });
            },
            source: this
        });
    }
}

Confession.code = '06017';

module.exports = Confession;
