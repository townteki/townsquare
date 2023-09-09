const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class CarsonsCantina extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Draw a card and gain 1 GR',
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin()
            },
            cost: [ability.costs.bootSelf()],
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(this.controller, this, {
                    activePrompt: {
                        menuTitle: 'Choose cheatin\' punishment',
                        buttons: [
                            { text: 'Get 1 GR', method: 'getGR' },
                            { text: 'Draw a card', method: 'drawCard' }
                        ]
                    },
                    source: this
                });                
            }
        });
    }

    getGR() {
        this.controller.modifyGhostRock(1);
        this.game.addMessage('{0} uses {1} to get 1 GR', this.controller, this);
        return true;
    }

    drawCard() {
        this.abilityContext.player.drawCardsToHand(1, this.abilityContext);
        this.game.addMessage('{0} uses {1} to draw a card', this.controller, this);        
        return true;
    }    
}

CarsonsCantina.code = '25034';

module.exports = CarsonsCantina;
