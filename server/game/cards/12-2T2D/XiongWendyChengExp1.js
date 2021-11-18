const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class XiongWendyChengExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'opponent',
            condition: () => true,
            match: card => card.location === 'play area' && 
                card.getType() === 'dude' &&
                card.isWanted() &&
                card.gamelocation === this.gamelocation,
            effect: ability.effects.modifyValue(-2)
        });

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
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
                if(context.target.bounty > context.target.getGrit(context)) {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to send {2} home booted and discards them', context.player, this, context.target);
                    });
                } else {
                    this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target);
                }
            }
        });
    }
}

XiongWendyChengExp1.code = '20021';

module.exports = XiongWendyChengExp1;
