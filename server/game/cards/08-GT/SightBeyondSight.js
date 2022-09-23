const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class SightBeyondSight extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Sight Beyond Sight',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.lookAtHand({ 
                    player: context.player, 
                    opponent: context.player.getOpponent(),
                    title: `Look at ${context.player.getOpponent().name}'s hand to ace a card`,
                    numToShow: 2,
                    condition: card => !card.isUnique(),
                    onSelect: (player, cards) => this.game.resolveGameAction(GameActions.aceCard({ card: this }), context).thenExecute(() => {
                        player.aceCards(cards, () => 
                            context.game.addMessage('{0} uses {1} to look at opponent\'s hand and ace itself to ace {2}', player, this, cards), {}, context);
                    }),
                    onCancel: player => 
                        context.game.addMessage('{0} uses {1} to look at opponent\'s hand but did not ace any card', player, this),
                    context
                }), context);
            }
        });
    }
}

SightBeyondSight.code = '14030';

module.exports = SightBeyondSight;
