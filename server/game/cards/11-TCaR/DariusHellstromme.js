const GameActions = require('../../GameActions/index.js');
const LegendCard = require('../../legendcard.js');

class DariusHellstromme extends LegendCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onShooterPicked: event => event.card.controller === this.controller &&                   
                    this.game.shootout.leaderPlayer === this.controller &&
                    !event.card.hasAttachmentWithKeywords(['gadget', 'weapon'])
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.event.card,
                    effect: ability.effects.modifyBullets(-2)
                }));
            }
        });
        
        this.reaction({
            triggerBefore: true,
            title: 'Darius Hellstromme',
            when: {
                onCardAced: event => this.game.shootout && 
                    event.card.controller !== this.controller &&
                    event.card.getType() === 'dude' &&
                    event.card.isParticipating(),
                onCardDiscarded: event => this.game.shootout && 
                    event.card.controller !== this.controller &&
                    event.card.getType() === 'dude' &&
                    event.card.isParticipating()
            },
            cost: [ability.costs.bootSelf()],
            target: {
                activePromptTitle: 'Choose a gadget weapon',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.hasAllOfKeywords(['gadget', 'weapon']) &&
                        card.parent.isParticipating()
                },
                cardType: ['goods'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a dude with gadget weapon',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.location === 'play area' &&
                            card.hasAttachmentWithKeywords(['gadget', 'weapon']),
                        cardType: 'dude',
                        onSelect: (player, dude) => {
                            dude.modifyControl(1);
                            this.game.addMessage('{0} uses {1} and boots {2} to give {3} permanent CP', 
                                player, this, context.target, dude);
                            return true;
                        },
                        source: this
                    });
                });
                if(context.event.name === 'onCardDiscarded') {
                    context.replaceHandler(event => {
                        this.game.resolveGameAction(GameActions.aceCard({ card: event.card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to ace {2} instead of discarding', 
                                context.player, this, event.card);
                        });
                    });
                }
            }
        });
    }
}

DariusHellstromme.code = '19001';

module.exports = DariusHellstromme;
