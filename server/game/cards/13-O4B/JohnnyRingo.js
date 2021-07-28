const DudeCard = require('../../dudecard.js');

class JohnnyRingo extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Johnny Ringo',
            playType: ['shootout'],
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                
            }
        });
    }
}

JohnnyRingo.code = '21032';

module.exports = JohnnyRingo;
