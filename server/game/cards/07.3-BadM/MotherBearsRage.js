const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class MotherBearsRage extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude to call out',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { condition: card => (card.gamelocation === this.gamelocation ||
                    card.isAdjacent(this.gamelocation) && !card.isInTownSquare())},
                cardType: ['dude'],
                gameAction: 'callOut'
            },
            difficulty: 5,
            onSuccess: (context) => {
                let naturespirit = context.player.placeToken('09042', context.target.gamelocation);
                if(context.target.canBeCalledOut()) {
                    this.game.resolveGameAction(GameActions.callOut({ 
                        caller: naturespirit,
                        callee: context.target,
                        isCardEffect: true,
                        canReject: true
                    }), context);
                    this.game.addMessage('{0} uses {1} to summon a Nature Spirit to call out {2}.', context.player, this, context.target); 
                } else {
                    naturespirit.removeFromGame();
                    this.game.addMessage('{0} Uses {1} to summon a Nature Spirit to call out {2}, but they cannot be called out', context.player, this, context.target);
                }
            },
            source: this
        });
    }
}

MotherBearsRage.code = '13017';

module.exports = MotherBearsRage;
