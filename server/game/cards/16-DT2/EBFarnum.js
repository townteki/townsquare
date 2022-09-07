const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const ShoppinCardAction = require('../../PlayActions/ShoppinCardAction.js');

class EBFarnum extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.game.on('onAbilityResolutionStarted', event => {
            if(event.context.player.getFaction() === Factions.Entrepreneurs &&
                event.context.source === this && event.ability.playTypePlayed() === 'shoppin') {
                this.game.promptForSelect(event.context.player, {
                    activePromptTitle: 'Select dudes to boot',
                    waitingPromptTitle: 'Waiting for opponent to select dudes',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === event.context.player &&
                        !card.booted,
                    cardType: 'dude',
                    gameAction: 'boot',
                    numCards: 0,
                    multiSelect: true,
                    onSelect: (player, cards) => {
                        player.bootCards(cards, event.context, bootedCards => {
                            event.ability.reduceAmount = bootedCards.reduce((agg, card) => agg + card.influence, 0);
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }

    setupCardAbilities() {
        this.action({
            title: 'Noon: E.B.Farnum',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: ['decreaseInfluence']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} -1 influence', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyInfluence(-1)
                }));
            }
        });
    }

    getPlayActions(type) {
        if(type === 'shoppin') {
            return [new EBShoppinAction()];
        }
        return super.getPlayActions();
    }
}

class EBShoppinAction extends ShoppinCardAction {
    canPayCosts() {
        return true;
    }
}

EBFarnum.code = '24038';

module.exports = EBFarnum;
