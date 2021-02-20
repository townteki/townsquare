const DeedCard = require('../../deedcard.js');

class PearlysPalace extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                onPlayWindowOpened: event => event.playWindow.name === 'shootout plays'
            },
            cost: ability.costs.bootSelf(),
            handler: (context) => {
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Make shootout play',
                        buttons: [
                            { text: 'Done', method: 'done' }
                        ],
                        promptTitle: this.title
                    },
                    source: this
                });
                this.game.addMessage('{0} uses {1} to make shootout play before any player.', this.controller, this);
            }
        });
    }

    done() {
        return true;
    }
}

PearlysPalace.code = '01064';

module.exports = PearlysPalace;
