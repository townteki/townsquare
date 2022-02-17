const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SanfordTaylor extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Sanford Taylor',
            playType: ['noon'],
            condition: () => this.locationCard.getType() === 'deed', 
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude to call out',
                cardCondition: {
                    controller: 'opponent',
                    condition: card => card.canBeCalledOut() && card.gamelocation === this.gamelocation
                },
                cardType: ['dude'],
                gameAction: 'callout'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ 
                    caller: this,
                    callee: context.target,
                    isCardEffect: true,
                    canReject: !this.isWanted()
                }), context);
            }
        });
    }
}

SanfordTaylor.code = '01039';

module.exports = SanfordTaylor;
