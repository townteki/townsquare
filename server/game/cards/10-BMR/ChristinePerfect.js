const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ChristinePerfect extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Christine Perfect',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: (card, context) => this.isOpposingDudeWithHighestGrit(card, context)
                },
                cardType: ['dude']
            },
            actionContext: { card: this, gameAction: 'moveDude' },
            message: context => this.game.addMessage('{0} moves {1} to {2}\'s location and reduces their value by 5', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: this, 
                    targetUuid: context.target.gamelocation
                }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: [
                            ability.effects.modifyValue(-5)
                        ]
                    }));
                });
            }
        });
    }

    isOpposingDudeWithHighestGrit(dude, context) {
        const opponentsDudes = this.game.getDudesInPlay(dude.controller);
        const highestGrit = opponentsDudes.reduce((highestGrit, dude) => {
            return Math.max(dude.getGrit(context), highestGrit);
        }, 0);
        return opponentsDudes.filter(dude => dude.getGrit(context) === highestGrit).includes(dude);
    }
}

ChristinePerfect.code = '18014';

module.exports = ChristinePerfect;
