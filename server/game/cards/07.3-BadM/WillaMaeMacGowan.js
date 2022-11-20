const DudeCard = require('../../dudecard.js');

class WillaMaeMacGowan extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Willa Mae MacGowan',
            playType: 'resolution',
            cost: ability.costs.aceSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1} to send all other dudes in her posse home booted', context.player, this),
            handler: context => {
                this.game.shootout.actOnPlayerPosse(context.player, card => this.game.shootout.sendHome(card, context));
            }
        });
    }
}

WillaMaeMacGowan.code = '13010';

module.exports = WillaMaeMacGowan;
