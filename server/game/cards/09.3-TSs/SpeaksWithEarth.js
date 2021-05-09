const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SpeaksWithEarth extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Speaks-With-Earth',
            when: {
                onDudeMoved: event => event.card.controller !== this.controller && event.target === this.gamelocation
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2} that just moved to his location', context.player, this, context.event.card),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.event.card }), context);
                if(this.locationCard.hasAttachmentWithKeywords('totem')) {
                    context.game.promptForYesNo(context.player, {
                        title: `Do you want to unboot a Totem at ${this.locationCard.title} ?`,
                        onYes: () => {
                            this.game.promptForSelect(context.player, {
                                activePromptTitle: 'Select a totem to unboot',
                                waitingPromptTitle: 'Waiting for opponent to select totem',
                                cardCondition: card => card.location === 'play area' &&
                                    card.getType() === 'spell' &&
                                    card.isTotem() &&
                                    card.booted &&
                                    card.parent === this.locationCard,
                                cardType: 'spell',
                                gameAction: 'unboot',
                                autoSelect: true,
                                onSelect: (player, card) => {
                                    this.game.resolveGameAction(GameActions.unbootCard({ card }), context);
                                    card.resetAbilities();
                                    this.game.addMessage('{0} uses {1} to unboot {2}, and its abilities may be used an additional time', player, this, card);
                                    return true;
                                },
                                source: this
                            });
                        },
                        source: this
                    });
                }
            }
        });
    }
}

SpeaksWithEarth.code = '17004';

module.exports = SpeaksWithEarth;
