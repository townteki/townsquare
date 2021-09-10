const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class NicoleSumner extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: [
                ability.effects.modifyBullets(3),
                ability.effects.setInfluence(0)
            ]
        });

        this.reaction({
            title: 'Reduce Bounty to 0',
            when: {
                onFirstPlayerDetermined: event => event.player === this.controller
            },
            message: context => this.game.addMessage('{0} uses {1}\'s react to reduce her bounty to 0', context.player, this),
            handler: (context) => {
                this.game.resolveGameAction(GameActions.removeBounty({ card: this, options: { removeAll: true } }), context);
            }
        });
    }
}

NicoleSumner.code = '22031';

module.exports = NicoleSumner;
