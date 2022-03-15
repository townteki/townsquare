const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class TheBloodyStar extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction({ not: { keyword: 'deputy' }});

        this.whileAttached({
            effect: [
                ability.effects.cannotRefuseCallout(this, dude => !dude.isWanted()),
                ability.effects.canBeCalledOutAtHome()
            ]
        });

        this.traitReaction({
            when: {
                onCardEntersPlay: event => this.equals(event.card)
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: this.parent, amount: 2 }), context).thenExecute(() => {
                    this.game.addMessage('{0} adds 2 bounty to {1} due to {2} entering play',
                        context.player, this.parent, this);
                });
            }
        });
    }
}

TheBloodyStar.code = '19030';

module.exports = TheBloodyStar;
