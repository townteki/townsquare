const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class ItsWhoYouKnow extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: '... It\'s Who You Know',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current'
                },
                cardType: ['dude']
            },
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
                        match: context.target,
                        effect: ability.effects.setAsStud()
                    }), context.causedByPlayType);
                    this.game.addMessage('{0}\'s dude {1} becomes a stud and for this shootout influence is used instead of bullet rating', 
                        context.player, context.target);
                };
                this.game.once('onShootoutPhaseStarted', eventHandler);
                this.game.onceConditional('onCardAbilityResolved', { condition: event => event.ability === context.ability },
                    () => this.game.removeListener('onShootoutPhaseStarted', eventHandler));
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select dude to call out',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.getType() === 'dude' && card.location === 'play area' &&
                            card.gamelocation === context.target.gamelocation &&
                            card.controller !== this.controller,
                    cardType: 'dude',
                    gameAction: 'callout',
                    onSelect: (player, card) => {
                        this.game.addMessage('{0} uses {1} and chooses {2} to call out {3}', context.player, this, context.target, card);
                        this.game.resolveGameAction(GameActions.callOut({ caller: context.target, callee: card }), context);
                        return true;
                    }
                });
            }
        });
    }
}

ItsWhoYouKnow.code = '03019';

module.exports = ItsWhoYouKnow;
