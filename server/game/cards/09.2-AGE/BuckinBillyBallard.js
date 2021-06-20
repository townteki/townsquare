const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class BuckinBillyBallard extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasHorse(),
            match: this,
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyInfluence(1)
            ]
        });
        this.action({
            title: 'Buckin\' Billy Ballard',
            playType: ['noon', 'shootout'],
            target: {
                activePromptTitle: 'Choose a Horse',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('horse') && card.parent === this 
                },
                cardType: ['goods', 'spell'],
                autoSelect: true,
                gameAction: 'boot'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to draw a card', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    context.player.drawCardsToHand(1, context);
                });
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to boot',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.gamelocation === this.gamelocation,
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to boot {2}', player, this, card);
                        });
                        return true;
                    }
                });
            }
        });
    }
}

BuckinBillyBallard.code = '16007';

module.exports = BuckinBillyBallard;
