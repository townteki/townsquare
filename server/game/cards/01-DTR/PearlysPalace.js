const DeedCard = require('../../deedcard.js');

class PearlysPalace extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Pearly\'s Palace',
            when: {
                onPlayWindowOpened: event => event.playWindow.name === 'shootout plays'
            },
            cost: ability.costs.bootSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1} to make a shootout play before any other player', context.player, this),
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
            }
        });
    }

    done() {
        return true;
    }
}

PearlysPalace.code = '01064';

module.exports = PearlysPalace;
