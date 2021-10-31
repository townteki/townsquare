const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Geronimo extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Geronimo',
            playType: ['noon'],
            ifCondition: () => !this.isAtHome(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not have any effect because he is at home', 
                    context.player, this),
            target: {
                activePromptTitle: 'Choose a card to discard',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.owner !== this.controller &&
                        card.parent && card.parent.gamelocation === this.gamelocation 
                },
                gameAction: 'discard',
                ifAble: true
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to gain 1 GR', context.player, this),
            handler: context => {
                if(context.target) {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target);
                    });
                }
                context.target.modifyGhostRock(1);
            }
        });
    }
}

Geronimo.code = '20013';

module.exports = Geronimo;
