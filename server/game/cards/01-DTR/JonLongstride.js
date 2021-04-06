const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class JonLongstride extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Jon Longstride',
            playType: 'noon',
            target: {
                activePromptTitle: 'Choose horse',
                cardCondition: { location: 'play area', condition: card => card.parent === this && card.hasKeyword('Horse') && card.booted },
                cardType: ['goods'],
                autoSelect: true
            },
            message: context =>
                this.game.addMessage('{0} uses {1}\'s ability to unboot {1}\'s Horse', context.player, this),
            handler: (context) => {
                context.target.resetAbilities();
                this.game.resolveGameActions(GameActions.unbootCard({ card: context.target }), context);
            }
        });
    }
}

JonLongstride.code = '01029';

module.exports = JonLongstride;
