const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');

class OneEyedJacksAreWild extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'One-eyed Jacks are Wild',
            playType: ['cheatin resolution'],
            target: {
                activePromptTitle: 'Choose card in draw hand',
                cardCondition: { location: 'draw hand', controller: 'current' },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action']
            },
            handler: context => {
                this.cardContext = context;
                this.game.promptForValue(context.player, `Change value in ${context.target.value} of ${context.target.suit} to`, 'chooseValue', this, this);
                if(this.game.currentPhase === PhaseNames.Gambling) {
                    context.player.drawCardsToHand(1, context);
                    this.game.addMessage('{0} uses {1} to draw a card', context.player, this);
                }         
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
        player.getHandRank().cheatin = false;
        this.game.addMessage('{0}\'s new hand is considered legal, and rank is {2}', player, this, player.getTotalRank());
        return true;
    } 
}

OneEyedJacksAreWild.code = '25051';

module.exports = OneEyedJacksAreWild;
