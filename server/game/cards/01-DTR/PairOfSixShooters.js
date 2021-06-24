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
                this.cardContext = context;
                this.game.promptForValue(context.player, `Change value in ${context.target.value} of ${context.target.suit} to`, 'chooseValue', this, this);                
            }
        });
    }

    chooseValue(player, arg) {
        this.untilEndOfShootoutRound(this.cardContext.ability, ability => ({
            match: this.cardContext.target,
            effect: ability.effects.setValue(arg, this.uuid)
        }), 'draw hand');
        this.game.promptForSuit(player, `Change suit in ${this.cardContext.target.value} of ${this.cardContext.target.suit} to`, 'chooseSuit', this, this);
        return true;
    }

    chooseSuit(player, arg) {
        this.untilEndOfShootoutRound(this.cardContext.ability, ability => ({
            match: this.cardContext.target,
            effect: ability.effects.setSuit(arg, this.uuid)
        }), 'draw hand');
        this.game.addMessage('{0} uses {1} to change suit and value of {2} in draw hand to {3}of{4}', 
            player, this, this.cardContext.target, this.cardContext.target.value, arg);
        player.determineHandResult('changes hand to');
        this.game.addMessage('{0}\'s new hand rank is {2}', player, this, player.getTotalRank());
        return true;
    }    
}

PairOfSixShooters.code = '01081';

module.exports = PairOfSixShooters;
