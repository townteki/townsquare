const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheLawGoesUnderground extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'The Law Goes Underground',
            playType: ['resolution'],
            cost: ability.costs.choose({
                'Boot Stud': ability.costs.boot({
                    type: 'dude',
                    condition: card => this.game.shootout && card.isStud() && this.game.shootout.getPosseByPlayer(this.controller).isInPosse(card)
                }),
                'Discard Stud': ability.costs.discardFromPlay({
                    type: 'dude',
                    condition: card => this.game.shootout && card.isStud() && this.game.shootout.getPosseByPlayer(this.controller).isInPosse(card)
                })
            }),
            message: context => this.game.addMessage('{0} uses {1} to flee to their hideout', context.player, this),
            handler: context => {
                const actor = context.costs.boot ? context.costs.boot : context.costs.discardFromPlay;
                const actorIsDeputy = actor.hasKeyword('deputy');
                if(actorIsDeputy) {
                    const opposingShooter = this.game.shootout.getPosseByPlayer(context.player.getOpponent()).shooter;
                    this.game.resolveGameAction(GameActions.sendHome({ card: opposingShooter, options: { needToBoot: true } }), context);
                    this.game.addMessage('{0} sends {1} home because {2} is a Deputy', context.player, opposingShooter, actor);
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
