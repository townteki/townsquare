const DeedCard = require('../../deedcard.js');

class HighStakesHaven extends DeedCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.isCheatin()
            },
            handler: () => {
                let choicemask = 0;
                if(this.controller.getSpendableGhostRock() >= 1) {
                    choicemask = choicemask | 1;
                }
                if(this.controller.hand.length) {
                    choicemask = choicemask | 2;
                }
                switch(choicemask) {
                    case 0://has no GR and no cards
                        this.game.addMessage('{0} avoids {1}\'s punishment due to abject poverty', this.controller, this);
                        break;
                    case 1://only has GR
                        this.payGR();
                        break;
                    case 2://only has cards
                        this.havenRandomDiscard();
                        break;
                    case 3://has both GR and cards
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
                        break;
                    default://how did this happen?
                        this.game.addMessage('Something went wrong when {0} triggered {1} (mask was {2})', this.controller, this, choicemask);
                        break;
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
        }, false);
        return true;
    }
}

HighStakesHaven.code = '15010';

module.exports = HighStakesHaven;
