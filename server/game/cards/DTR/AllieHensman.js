const DudeCard = require('../../dudecard.js');

class AllieHensman extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Allie Hensman',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            handler: context => {
                if(this.isInTownSquare()) {
                    this.modifyControl(1);
                    this.game.addMessage('{0} uses {1} to gain permanent control point.', context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1} but does not gain any control point because Allie is not in Town Square.', context.player, this);
                }
            }
        });
    }
}

AllieHensman.code = '01035';

module.exports = AllieHensman;
