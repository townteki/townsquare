const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Mugging extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Mugging',
            playType: 'noon',
            target: {
                activePromptTitle: 'Mark an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select up to 2 attachments',
                    waitingPromptTitle: 'Waiting for opponent to select attachments',
                    cardCondition: card => card.parent === context.target,
                    cardType: ['goods', 'spell', 'action'],
                    numCards: 2,
                    multiSelect: true,
                    gameAction: 'boot',
                    onSelect: (player, cards) => {
                        player.bootCards(cards, context);
                        this.game.addMessage('{0} uses {1} to boot {2} attached to {3}', player, this, cards, context.target);
                        return true;
                    }
                });
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.sendHome({ card: job.mark }), context).thenExecute(() =>
                    this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, job.mark));
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select up to 2 attachments',
                    waitingPromptTitle: 'Waiting for opponent to select attachments',
                    cardCondition: card => card.parent === job.mark && card.booted,
                    cardType: ['goods', 'spell', 'action'],
                    numCards: 2,
                    multiSelect: true,
                    gameAction: 'ace',
                    onSelect: (player, cards) => {
                        player.aceCards(cards, () => 
                            this.game.addMessage('{0} uses {1} to ace {2} attached to {3}', player, this, cards, job.mark), {}, context);
                        return true;
                    }
                });                
            }
        });
    }
}

Mugging.code = '13019';

module.exports = Mugging;
