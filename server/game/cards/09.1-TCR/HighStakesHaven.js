const DeedCard = require('../../deedcard.js');

class HighStakesHaven extends DeedCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.isCheatin()
            },
            handler: () => {
                if(this.controller.getSpendableGhostRock() <= 0) {
                    this.havenRandomDiscard();
                } else if(this.controller.hand.length) {
                    this.game.promptWithMenu(this.controller, this, {
                        activePrompt: {
                            menuTitle: 'Choose cheatin\' punishment',
                            buttons: [
                                { text: 'Pay 1 GR', method: 'payGR' },
                                { text: 'Discard card', method: 'havenRandomDiscard' }
                            ]
                        },
                        source: this
                    });
                }
            }
        });
    }

    payGR() {
        this.controller.spendGhostRock(1);
        this.game.addMessage('{0} pays 1 GR due to {1}', this.controller, this);
        return true;
    }

    havenRandomDiscard() {
        this.controller.discardAtRandom(1, discarded => {
            this.game.addMessage('{0} discards randomly from hand card {1} due to {2}', 
                this.controller, discarded, this);
        });
        return true;
    }
}

HighStakesHaven.code = '15010';

module.exports = HighStakesHaven;
