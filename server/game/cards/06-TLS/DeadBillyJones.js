const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DeadBillyJones extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: "Dead" Billy Jones',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.hasHorse() &&
                        card.isNearby(this.gamelocation)                         
                },
                cardType: ['dude'],
                gameAction: 'moveDude',
                ifAble: true
            },
            ifCondition: () => this.controller.cardsInPlay.some(card => card.hasKeyword('ranch')),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails as they do not control a Ranch', context.player, this),
            handler: context => {
                if(!context.target) {
                    this.game.addMessage('{0} uses {1} but there is no dude with a horse', context.player, this);
                    return;
                }
                this.game.promptForLocation(context.player, {
                    activePromptTitle: `Select where to move ${context.target.title}`,
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);                                 
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

DeadBillyJones.code = '10014';

module.exports = DeadBillyJones;
