const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class KevinWainwright extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Kevin Wainwright',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select huckster for Kevin to move to',
                cardCondition: { location: 'play area', controller: 'current', condition: card => card.hasKeyword('huckster') },
                cardType: ['dude']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: this, 
                    targetUuid: context.target.gamelocation,
                    options: { needToBoot: false, allowBooted: true }
                }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setAsStud()
                    }));
                    this.game.addMessage('{0} uses {1} to move him to {2}\'s location and make him a stud.', context.player, this, context.target);
                });
            }
        });
    }
}

KevinWainwright.code = '01011';

module.exports = KevinWainwright;
