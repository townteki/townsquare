const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class OpenWound extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: this,
            effect: [
                ability.effects.additionalDynamicAdjacency(card => card.location === 'play area' && 
                    ['16012', '24140'].includes(card.code) && card !== this, this.uuid)
            ]
        });
        this.action({
            title: '"Open Wound"',
            playType: 'noon',
            cost: ability.costs.payGhostRock(1),
            repeatable: true,
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Choose destination for ' + context.target.title,
                    waitingPromptTitle: 'Waiting for opponent to choose destination',
                    cardCondition: { location: 'play area', condition: card => card.isAdjacent(this.uuid) },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', 
                            player, this, context.target, location);                                 
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
