const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class RedHorsesTail extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    condition: card => card.gamelocation === this.parent.gamelocation
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            difficulty: context => context.target.value,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            difficulty: context => context.target.getGrit(),
            onSuccess: (context) => {
                this.game.shootout.sendHome(context.target, context)
                    .thenExecute(() => this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target));
            },
            source: this
        });
    }
}

RedHorsesTail.code = '10032';

module.exports = RedHorsesTail;
