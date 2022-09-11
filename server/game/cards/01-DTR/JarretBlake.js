const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class JarretBlake extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Jarret Blake',
            playType: ['shootout:join'],
            target: {
                activePromptTitle: 'Select dude to swap',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude'],
                gameAction: card => {
                    const actions = ['removeFromPosse'];
                    if(card.gamelocation !== this.gamelocation) {
                        actions.push('moveDude');
                    }
                    return actions;
                }
            },
            actionContext: { card: this, gameAction: 'joinPosse' },
            ifCondition: () => this.hasAttachment(attachment => attachment.hasKeyword('Horse')),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but fails because he does not have a horse', context.player, this),
            message: context => 
                this.game.addMessage('{0} uses {1} to swap him with {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.removeFromPosse({ card: context.target }), context).thenExecute(() => {
                    this.game.resolveGameAction(GameActions.moveDude({ card: context.target, targetUuid: this.gamelocation }));
                    this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context);
                });
            }
        });
    }
}

JarretBlake.code = '01031';

module.exports = JarretBlake;
