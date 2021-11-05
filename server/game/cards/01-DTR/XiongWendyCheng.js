const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class XiongWendyCheng extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Xiong "Wendy" Cheng',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true 
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            message: context => this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target),
            handler: context => this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context)
        });
    }
}

XiongWendyCheng.code = '01021';

module.exports = XiongWendyCheng;
