const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class DeliberateInfection extends ActionCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent.getType() === 'dude',
            effect: [
                ability.effects.modifyUpkeep(1),
                ability.effects.modifyInfluence(-1)
            ]
        });
        this.action({
            title: 'Deliberate Infection',
            playType: 'cheatin resolution',
            condition: () => !this.parent,
            target: {
                choosingPlayer: 'thisIfShootout',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: 'dude'
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}',
                context.player, this, context.target),
            handler: context => {
                context.player.attach(this, context.target, 'ability', () => {
                    this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
                });
            },
            source: this
        });
    } 
}

DeliberateInfection.code = '12021';

module.exports = DeliberateInfection;
