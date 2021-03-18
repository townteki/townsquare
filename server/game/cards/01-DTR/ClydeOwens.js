const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ClydeOwens extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Clyde Owens',
            playType: 'noon',
            target: {
                activePromptTitle: 'Select a dude to call out',
                cardCondition: {controller: 'opponent', condition: card => card.canBeCalledOut() && card.gamelocation === this.gamelocation },
                cardType: ['dude']
            },
            handler: context => {
                if(context.target.isWanted()) {
                    this.game.resolveGameAction(GameActions.callOut({ 
                        caller: this,
                        callee: context.target,
                        isCardEffect: true,
                        canReject: false
                    }), context);
                } else {
                    this.game.resolveGameAction(GameActions.callOut({ 
                        caller: this,
                        callee: context.target,
                        isCardEffect: true,
                        canReject: true
                    }), context);
                }
            }
        });
    }
}

ClydeOwens.code = '01022';

module.exports = ClydeOwens;
