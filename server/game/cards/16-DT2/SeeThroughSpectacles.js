const GoodsCard = require('../../goodscard.js');

class SeeThroughSpectacles extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: See-Through Spectacles',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a card in draw hand',
                choosingPlayer: 'current',
                cardCondition: { location: 'draw hand', controller: 'current' },
                cardType: ['dude', 'deed', 'action', 'goods', 'spell']
            },
            handler: context => {
                this.cardContext = context;
                if(context.target.suit === 'Hearts') {
                    this.cardToChange = context.target;
                    this.game.promptForValue(context.player, `Change value in ${context.target.value} of ${context.target.suit} to`, 'chooseValue', this, this, 
                        (player, value) => !player.drawHand.some(card => card !== context.target && card.value === value));
                } else {
                    this.untilEndOfShootoutRound(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.setSuit('Hearts', this.uuid)
                    }), 'draw hand');
                    this.game.addMessage('{0} uses {1} to change suit of {2} to Hearts', context.player, this, context.target);
                    context.player.determineHandResult('changes hand to');               
                }
            }
        });
    }

    chooseValue(player, arg) {
        this.untilEndOfShootoutRound(this.cardContext.ability, ability => ({
            match: this.cardToChange,
            effect: ability.effects.setValue(arg, this.uuid)
        }), 'draw hand');
        this.game.addMessage('{0} uses {1} to change value of {2} to {3}', player, this, this.cardToChange, arg);
        player.determineHandResult('changes hand to');
        return true;
    }
}

SeeThroughSpectacles.code = '24159';

module.exports = SeeThroughSpectacles;
