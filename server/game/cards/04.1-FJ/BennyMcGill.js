const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class BennyMcGill extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Benny McGill',
            playType: 'noon',
            cost: ability.costs.boot({
                type: 'spell',
                condition: card => card.isHex() && card.parent === this
            }),
            target: {
                activePromptTitle: 'Select a dude to call out',
                cardCondition: {
                    controller: 'opponent',
                    condition: card => card.canBeCalledOut() &&
                        card.gamelocation === this.gamelocation &&
                        card.bullets > this.bullets
                },
                cardType: ['dude'],
                gameAction: 'callout'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ 
                    caller: this,
                    callee: context.target,
                    isCardEffect: true,
                    canReject: false
                }), context);
            }
        });
    }
}

BennyMcGill.code = '06007';

module.exports = BennyMcGill;
