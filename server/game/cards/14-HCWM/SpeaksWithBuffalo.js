const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SpeaksWithBuffalo extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Speaks-with-Buffalo',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Mark opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            handler: context => {
                let eventHandler = () => {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutPhaseFinished: () => true
                        },
                        match: this.game.shootout,
                        effect: ability.effects.useInfluenceForShootout()
                    }), context.causedByPlayType);
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutPhaseFinished: () => true
                        },
                        match: this,
                        effect: ability.effects.setAsStud()
                    }), context.causedByPlayType);
                    this.game.addMessage('{0}\'s dude {1} becomes a stud and for this shootout influence is used instead of bullet rating', 
                        context.player, this);
                };
                this.game.once('onShootoutPhaseStarted', eventHandler);
                this.game.onceConditional('onCardAbilityResolved', { condition: event => event.ability === context.ability },
                    () => this.game.removeListener('onShootoutPhaseStarted', eventHandler));
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
                this.game.resolveGameAction(GameActions.drawCards({ player: context.player, amount: 2 }), context).thenExecute(() => {
                    this.game.promptForSelect(this.controller, {
                        promptTitle: this.title,
                        activePromptTitle: 'Select 2 cards to discard',
                        waitingPromptTitle: 'Waiting for opponent to discard cards',
                        numCards: 2,
                        multiSelect: true,
                        mode: 'exactly',
                        cardCondition: card => card.location === 'hand' && card.controller === this.controller,
                        onSelect: (p, cards) => {
                            p.discardCards(cards, () => {
                                this.game.addMessage('{0} draws 2 cards and then discards {1} thanks to the {2}', p, cards, this);
                            }, {}, context);
                            return true;
                        }
                    }); 
                }); 
            }
        });
    }
}

SpeaksWithBuffalo.code = '22019';

module.exports = SpeaksWithBuffalo;
