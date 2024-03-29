const DeedCard = require('../../deedcard.js');

class OldMargesManor extends DeedCard {
    entersPlay() {
        super.entersPlay();
        this.game.addAlert('warning', '{0}\'s React ability has to be used as a regular Noon ability ' +
            'that is triggered from the menu', this);
    }
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.canSpendGhostRock(spendParams =>
                this.game.shootout &&
                spendParams.activePlayer === this.controller && 
                spendParams.context && spendParams.context.source &&
                (spendParams.context.source.getType() === 'action' ||
                (spendParams.context.source.hasKeyword('gadget') && this.isCardAbility(spendParams)))
            )
        });
        this.action({
            title: 'React: Move GR to Old Marge\'s Manor',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a card to transfer GR from',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.ghostrock && card !== this
                },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to transfer all GR from {2} before making a play', 
                    context.player, this, context.target),
            handler: context => {
                this.game.transferGhostRock({ from: context.target, to: this, amount: context.target.ghostrock });
                this.game.makePlayOutOfOrder(context.player, this);               
            }
        });
        this.action({
            title: 'Noon: Place 1 GR on Old Marge\'s Manor',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context => this.game.addMessage('{0} uses {1} to place 1 GR on it', context.player, this),
            handler: () => {
                this.modifyGhostRock(1);
            }
        });
    }

    isCardAbility(spendParams) {
        if(!spendParams.context || !spendParams.context.ability) {
            return false;
        }
        return spendParams.context.ability.isCardAbility();
    }
}

OldMargesManor.code = '12012';

module.exports = OldMargesManor;
