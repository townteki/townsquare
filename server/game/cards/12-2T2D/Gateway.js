const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Gateway extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Move Abomination',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    keyword: 'abomination',
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            difficulty: 6,
            onSuccess: (context) => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where to move ' + context.target.title,
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);                                 
                        return true;
                    },
                    source: this,
                    context
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Join Abomination',
            playType: ['shootout:join'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude to join',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    keyword: 'abomination',
                    participating: false 
                },
                cardType: ['dude'],
                gameAction: 'joinPosse'
            },
            difficulty: 6,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, context.target);
                });
            },
            source: this
        });
    }
}

Gateway.code = '20046';

module.exports = Gateway;
