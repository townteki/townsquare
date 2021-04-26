const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class OpenWound extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: this,
            effect: [
                ability.effects.additionalDynamicAdjacency(card => card.location === 'play area' && card.code === '16012' && card !== this, this.uuid)
            ]
        });
        this.action({
            title: '"Open Wound"',
            playType: 'noon',
            cost: ability.costs.payGhostRock(1),
            repeatable: true,
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller === this.controller &&
                        card.gamelocation === this.gamelocation,
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.game.promptForLocation(player, {
                            activePromptTitle: 'Choose destination for ' + dude.title,
                            waitingPromptTitle: 'Waiting for opponent to choose destination',
                            cardCondition: { location: 'play area', condition: card => card.isAdjacent(this.uuid) },
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

OpenWound.code = '16012';

module.exports = OpenWound;
