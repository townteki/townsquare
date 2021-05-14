const DeedCard = require('../../deedcard.js');

class SecondBankofGomorra extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Place 2 Ghost Rock',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            message: context => this.game.addMessage('{0} uses {1} to place 2 GR on {1}', context.player, this),
            handler: () => {
                this.modifyGhostRock(2);
            }
        });

        this.action({
            title: 'Take All Ghost Rock',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            message: context => this.game.addMessage('{0} uses {1} to gain {2} GR', context.player, this, this.ghostrock),
            handler: context => {
                this.game.transferGhostRock({ from: this, to: context.player, amount: this.ghostrock });
            }
        });
    }
}

SecondBankofGomorra.code = '15009';

module.exports = SecondBankofGomorra;
