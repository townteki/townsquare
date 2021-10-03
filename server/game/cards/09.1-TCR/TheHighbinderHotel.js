const DeedCard = require('../../deedcard.js');

class TheHighbinderHotel extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Highbinder Hotel',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude to evacuate',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: 'dude',
                gameAction: 'sendHome'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target),
            handler: context => {
                this.game.shootout.sendHome(context.target, context);
            }
        });
    }
}

TheHighbinderHotel.code = '15008';

module.exports = TheHighbinderHotel;
