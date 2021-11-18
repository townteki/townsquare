const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class EagleWomanThatAllLookAt extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.useDefaultReducer = true;
        this.game.on('onAbilityResolutionStarted', event => {
            if(event.ability.playType === 'shoppin' && event.context && event.context.source === this) {
                this.game.promptForSelect(this.controller, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller &&
                        this.costCanBePaid(card),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.useDefaultReducer = false;
                        this.lastingEffect(event.ability, ability => ({
                            location: 'any',
                            until: {
                                onAbilityResolutionFinished: () => true
                            },
                            condition: () => this.controller.getFaction() === Factions.FirstPeoples, 
                            effect: ability.effects.reduceSelfCost('any', () => dude.influence)
                        }));
                        this.game.promptForYesNo(player, {
                            title: `Do you want to move to ${dude.locationCard.title}?`,
                            onYes: () => {
                                if(event.ability) {
                                    event.ability.properties.target = dude.gamelocation;
                                }
                            },
                            source: this
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }

    leavesPlay() {
        super.leavesPlay();
        this.useDefaultReducer = true;
    }

    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.useDefaultReducer && this.controller.getFaction() === Factions.FirstPeoples, 
            effect: ability.effects.reduceSelfCost('any', () => this.getHighestInfluence())
        });

        this.persistentEffect({
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.controller === this.controller &&
                card.getType() === 'dude' && card.hasKeyword('shaman'),
            effect: ability.effects.addCardAction({
                title: 'Noon/Shootout: Move Eagle Woman here',
                playType: ['noon', 'shootout'],
                cost: ability.costs.boot((card, context) => card.location === 'play area' &&
                    card.getType() === 'spell' && card.hasKeyword('Spirit') &&
                    card.gamelocation === context.source.gamelocation),
                handler: context => {
                    if(this.game.shootout) {
                        this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to move {2} to their location and join posse', context.player, context.source, this);
                        });
                    } else {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this, 
                            targetUuid: context.source.gamelocation 
                        }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to move {2} to their location', context.player, context.source, this);
                        });
                    }
                }
            })
        });
    }

    getHighestInfluence() {
        return this.controller.cardsInPlay.filter(card => card.getType() === 'dude').
            reduce((maxInfluence, dude) => dude.influence > maxInfluence ? dude.influence : maxInfluence, 0);
    }

    costCanBePaid(card) {
        return this.controller.getSpendableGhostRock() + card.influence >= this.cost;
    }
}

EagleWomanThatAllLookAt.code = '25050';

module.exports = EagleWomanThatAllLookAt;
