const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class SpiritTrail extends SpellCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            targetController: 'any',
            condition: () => true,
            effect: [
                ability.effects.additionalDynamicAdjacency(card => {
                    if(!card.isLocationCard()) {
                        return false;
                    }
                    return this.game.findCardsInLocation(card.uuid, 
                        cardInLocation => ['09033', '24207'].includes(cardInLocation.code) && !cardInLocation.isNotPlanted()).length;
                }, this.uuid)
            ]
        });
        this.spellAction({
            title: 'Spirit Trail',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller === context.player &&
                        card.gamelocation === this.gamelocation,
                    cardType: 'dude',
                    gameAction: 'moveDude',
                    onSelect: (player, dude) => {
                        this.game.promptForLocation(player, {
                            activePromptTitle: 'Choose destination for ' + dude.title,
                            waitingPromptTitle: 'Waiting for opponent to choose destination',
                            cardCondition: { location: 'play area' },
                            onSelect: (player, location) => {
                                this.game.resolveGameAction(GameActions.moveDude({ 
                                    card: dude, 
                                    targetUuid: location.uuid
                                }), context);   
                                this.game.addMessage('{0} uses {1} to move {2} to {3}', 
                                    player, this, dude, location);                                 
                                return true;
                            }
                        }); 
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

SpiritTrail.code = '09033';

module.exports = SpiritTrail;
