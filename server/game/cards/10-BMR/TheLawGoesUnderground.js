const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheLawGoesUnderground extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'The Law Goes Underground',
            playType: ['resolution'],
            target: {
                activePromptTitle: 'Choose your stud dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    participating: true,
                    controller: 'current',
                    condition: card => card.isStud()
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to flee to their hideout', context.player, this),
            handler: context => {
                const actorIsDeputy = context.target.hasKeyword('deputy');
                if(context.target.booted) {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                    this.game.addMessage('{0} discards {1} because they are booted', context.player, context.target);
                } else {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                    this.game.addMessage('{0} boots {1}', context.player, context.target);
                }
                if(actorIsDeputy) {
                    const opposingShooter = this.game.shootout.getPosseByPlayer(context.player.getOpponent()).shooter;
                    this.game.resolveGameAction(GameActions.sendHome({ card: opposingShooter, options: { needToBoot: true } }), context);
                    this.game.addMessage('{0} sends {1} home because {2} is a Deputy', context.player, opposingShooter, context.target);
                }
                let action = GameActions.simultaneously(
                    this.game.shootout.getPosseByPlayer(context.player).getDudes().map(card => GameActions.sendHome({
                        card: card,
                        options: { needToBoot: true }
                    }))
                );
                this.game.resolveGameAction(action, context);
                this.game.addMessage('{0} sends their posse running home', context.player);
            }
        });
    }
}

TheLawGoesUnderground.code = '18040';

module.exports = TheLawGoesUnderground;
