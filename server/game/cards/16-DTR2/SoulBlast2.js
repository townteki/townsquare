const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class SoulBlast2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Soul Blast',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude whose soul to blast',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            difficulty: context => context.target.getGrit(context),
            onSuccess: (context) => {
                if(context.totalPullValue - 6 >= context.difficulty) {
                    this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context)
                        .thenExecute(() => this.game.addMessage('{0} uses {1} to ace {2}', context.player, this, context.target));
                } else {
                    this.game.shootout.sendHome(context.target, context)
                        .thenExecute(() => this.game.addMessage('{0} uses {1} to send {2} home', context.player, this, context.target));
                }
            },
            onFail: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this.parent }), context)
                    .thenExecute(() => this.game.addMessage('{0} boots {1} as a result of failed {2}', context.player, this.parent, this));                
            },
            source: this
        });
    }
}

SoulBlast2.code = '25228';

module.exports = SoulBlast2;

