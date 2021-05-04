const GoodsCard = require('../../goodscard.js');

class PairOfSixShooters extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Pair of Six-Shooters',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose card in draw hand',
                cardCondition: { location: 'draw hand', controller: 'current' },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action']
            },
            handler: context => {
                this.cardToChange = context.target;
                this.game.promptForValue(context.player, `Change value in ${context.target.value} of ${context.target.suit} to`, 'chooseValue', this, this);                
            }
        });
    }

    chooseValue(player, arg) {
        this.untilEndOfShootoutRound(ability => ({
            match: this.cardToChange,
            effect: ability.effects.setValue(arg, this.uuid)
        }), null, 'draw hand');
        this.game.promptForSuit(player, `Change suit in ${this.cardToChange.value} of ${this.cardToChange.suit} to`, 'chooseSuit', this, this);
        return true;
    }

    chooseSuit(player, arg) {
        this.untilEndOfShootoutRound(ability => ({
            match: this.cardToChange,
            effect: ability.effects.setSuit(arg, this.uuid)
        }), null, 'draw hand');
        this.game.addMessage('{0} uses {1} to change suit and value of {2} in draw hand to {3}of{4}', 
            player, this, this.cardToChange, this.cardToChange.value, arg);
        player.determineHandResult('changes hand to');
        this.game.addMessage('{0}\'s new hand rank is {2}', player, this, player.getTotalRank());
        return true;
    }    
}

PairOfSixShooters.code = '01081';

module.exports = PairOfSixShooters;
