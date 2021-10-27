const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class KevinWainwright extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Kevin Wainwright',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select huckster for Kevin to move to',
                cardCondition: { location: 'play area', controller: 'any', condition: card => card.hasKeyword('huckster') },
                cardType: ['dude']
            },
            actionContext: { card: this, gameAction: 'moveDude' },
            message: context => 
                this.game.addMessage('{0} uses {1} to move him to {2}\'s location and make him a stud', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: this, 
                    targetUuid: context.target.gamelocation
                }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setAsStud()
                    }));
                });
            }
        });
    }
}

KevinWainwright.code = '01011';

module.exports = KevinWainwright;
