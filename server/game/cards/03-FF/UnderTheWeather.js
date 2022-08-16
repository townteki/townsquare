const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class UnderTheWeather extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Under the Weather',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude who is Under the Weather',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any' },
                cardType: ['dude']
            },
            handler: context => {
                const health = context.target.getGrit();
                context.player.pull((pulledCard, pulledValue) => {
                    if(pulledValue >= health) {
                        this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                        if(pulledValue >= (health + 6)) {
                            this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
                            this.game.addMessage('{0} plays {1} on {2} who goes home booted', context.player, this, context.target);
                        } else {
                            this.game.addMessage('{0} plays {1} on {2} who boots', context.player, this, context.target);
                        }
                    } else {
                        this.game.addMessage('{0} plays {1} on {2} who shrugs it off', context.player, this, context.target);
                    }
                }, true, { context });
            }
        });
    }
}

UnderTheWeather.code = '05036';

module.exports = UnderTheWeather;
