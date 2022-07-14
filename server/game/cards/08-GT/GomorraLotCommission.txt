const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class GomorraLotCommission extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Gomorra Lot Commission',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand(card => card.getType() === 'deed')
            ],
            message: context => this.game.addMessage('{0} uses {1} and discards {2} to gain 1 GR',
                context.player, this, context.costs.discardFromHand),
            handler: context => {
                context.player.modifyGhostRock(1);
                const listedPlaces = this.game.filterCardsInPlay(card => card.getType() === 'deed' && card.title === context.costs.discardFromHand.title);
                if(listedPlaces.length > 0) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select a dude to move',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.location === 'play area' && card.controller.equals(context.player),
                        cardType: ['dude'],
                        gameAction: 'moveDude',
                        onSelect: (player, movingDude) => {
                            const erstwhileLocation = movingDude.locationCard;
                            context.ability.promptForLocation(context.player, {
                                activePromptTitle: 'Select destination for ' + movingDude.title,
                                waitingPromptTitle: 'Waiting for opponent to select location',
                                cardCondition: {
                                    location: 'play area',
                                    condition: card => listedPlaces.includes(card)
                                },
                                cardType: 'deed',
                                onSelect: (player, mappedDeed) => {
                                    this.game.resolveGameAction(GameActions.moveDude({ 
                                        card: movingDude,
                                        targetUuid: mappedDeed.gamelocation
                                    }), context).thenExecute(() => this.game.addMessage('{0} further uses {1} to send {2} from {3} to {4}',
                                        context.player, this, movingDude, erstwhileLocation, mappedDeed));
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

GomorraLotCommission.code = '14014';

module.exports = GomorraLotCommission;
