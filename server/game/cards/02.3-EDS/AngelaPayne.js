const DudeCard = require('../../dudecard.js');

class AngelaPayne extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Gain 2 Ghost Rock',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.locationCard.owner !== this.controller && this.locationCard.getType() === 'deed',
            ifFailMessage: context => this.game.addMessage('{0} boots {1} but does not gain any GR because she is not at a deed {0} doesn\'t own', context.player, this),
            message: context => this.game.addMessage('{0} boots {1} to gain 2 GR', context.player, this),
            handler: () => {
                this.controller.modifyGhostRock(2);
            }
        });    
    }
}

AngelaPayne.code = '04011';

module.exports = AngelaPayne;
