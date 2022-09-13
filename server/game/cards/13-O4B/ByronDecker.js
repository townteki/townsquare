const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ByronDecker extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords(['weapon', 'gadget']),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
        this.reaction({
            title: 'Byron Decker',
            triggerBefore: true,
            when: {
                onCardAced: event => event.canPrevent && event.card === this &&
                    (event.isCasualty || (event.context && ['shootout', 'resolution'].includes(event.context.ability.playTypePlayed())))
            },
            target: {
                activePromptTitle: 'Select dude to save Byron',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true,
                    condition: card => card !== this
                },
                cardType: ['dude'],
                gameAction: 'discard'
            },
            handler: context => {
                context.event.cancel(); 
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} and discards {2} to save {1}', context.player, this, context.target);
                });
            }
        });
    }
}

ByronDecker.code = '21035';

module.exports = ByronDecker;
