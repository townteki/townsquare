const DudeCard = require('../../dudecard.js');

class WillaMaeMacGowan extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Willa Mae MacGowan',
            playType: 'resolution',
            cost: ability.costs.aceSelf(),
            handler: context => {
                this.game.shootout.actOnPlayerPosse(context.player, card => this.game.shootout.sendHome(card));
                this.game.addMessage('{0} uses {1} to send all other dudes in her posse home booted.', context.player, this);
            }
        });
    }
}

WillaMaeMacGowan.code = '13010';

module.exports = WillaMaeMacGowan;
