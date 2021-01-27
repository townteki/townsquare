const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SamanthaSammyCooke extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Samantha "Sammy" Cooke',
            playType: ['noon'],
            cost: [ 
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1)
            ],
            target: {
                activePromptTitle: 'Select goods to discard',
                cardCondition: { location: 'play area', controller: 'opponent', condition: card => card.isInSameLocation(this) },
                cardType: ['goods']
            },
            handler: context => {
                if (context.target.hasKeyword('Horse')) {
                    let pulledCard = context.player.pull();
                    if (pulledCard.value > context.target.value) {
                        this.game.addMessage('{0} uses {1} to successfuly catch {2} after pulling {3}.', context.player, this, context.target, pulledCard.value);
                        if (context.player.attach(context.target, this, 'ability')) {                 
                            return;
                        }
                        this.game.addMessage('{0} cannot attach {1} to {2}, and is discarded.', context.player, context.target, this);
                    } else {
                        this.game.addMessage('{0} uses {1} who tries to catch {2}, but fails after pulling {3}.', context.player, this, context.target, pulledCard.value);
                    }
                } else {
                    this.game.addMessage('{0} uses {1} to discard {2}.', context.player, this, context.target);
                }
                this.game.resolveGameAction(GameActions.discardCard( {card: context.target }));
            }
        });
    }
}

SamanthaSammyCooke.code = '10016';

module.exports = SamanthaSammyCooke;