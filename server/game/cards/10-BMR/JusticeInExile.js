const PhaseNames = require('../../Constants/PhaseNames');
const GameActions = require('../../GameActions');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JusticeInExile extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                const opponent = context.player.getOpponent();
                const choosingPlayer = context.player.isCheatin() ? opponent : context.player;
                context.ability.selectAnotherTarget(choosingPlayer, context, {
                    activePromptTitle: 'Choose a card to raise bounty',
                    cardCondition: { 
                        location: 'play area', 
                        condition: card => card.controller === opponent
                    },
                    cardType: 'dude',
                    gameAction: 'addBounty',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.addBounty({ card }), context);
                        this.game.addMessage('{0} raises bounty on {1} due to {2}', player, card, this);
                        return true;
                    },
                    source: this,
                    context
                });
            }
        });

        this.reaction({
            title: 'React: Justice In Exile',
            triggerBefore: true,
            when: {
                onCardDiscarded: event => this.jieReactCondition(event),
                onCardLeftPlay: event => event.targetLocation !== 'discard pile' &&
                    this.jieReactCondition(event)
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.modifyGhostRock(2);
                if(context.event.name === 'onCardDiscarded') {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to ace ${context.event.card.title} instead?`,
                        onYes: player => {
                            context.replaceHandler(event => {
                                this.game.resolveGameAction(GameActions.aceCard({ card: event.card }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} to gain 2 GR and ace {2} instead of discarding', 
                                        player, this, event.card);
                                });
                            });
                        },
                        source: this
                    });
                } else {
                    this.game.addMessage('{0} uses {1} to gain 2 GR', context.player, this);
                }
            }
        });        
    }

    jieReactCondition(event) {
        return [PhaseNames.HighNoon, PhaseNames.Shootout].includes(this.game.currentPhase) &&
            event.card.controller !== this.owner &&
            event.card.getType() === 'dude' &&
            event.card.isWanted() &&
            this.game.getDudesAtLocation(event.originalGameLocation, dude => 
                dude.controller === this.owner && dude.hasKeyword('deputy')).length;
    }
}

JusticeInExile.code = '18004';

module.exports = JusticeInExile;
