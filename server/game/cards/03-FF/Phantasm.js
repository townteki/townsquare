const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Phantasm extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Phantasm: Move Unbooted Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select unbooted dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => 
                        card.gamelocation === this.gamelocation ||
                        card.getGameLocation().isAdjacent(this.gamelocation) &&
                        !card.booted
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            difficulty: 9,
            onSuccess: context => {
                this.game.promptForLocation(this.controller, {
                    promptTitle: this.title,
                    activePromptTitle: 'Select where the dude should move to',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: {
                        location: 'play area',
                        condition: card => 
                            card.getGameLocation().isAdjacent(context.target.gamelocation)
                    },
                    cardType: ['location', 'townsquare'],
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, context.target, location);
                        return true;
                    }
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Noon: Phantasm: Move Booted Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select booted dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => 
                        card.gamelocation === this.parent.gamelocation &&
                        card.booted
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            difficulty: 12,
            onSuccess: context => {
                this.game.promptForLocation(this.controller, {
                    promptTitle: this.title,
                    activePromptTitle: 'Select where the dude should move to',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: {
                        location: 'play area',
                        condition: card => 
                            card.getGameLocation().isAdjacent(context.target.gamelocation)
                    },
                    cardType: ['location', 'townsquare'],
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, context.target, location);
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

Phantasm.code = '05032';

module.exports = Phantasm;
