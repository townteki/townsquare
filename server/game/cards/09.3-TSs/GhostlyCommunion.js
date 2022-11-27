const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class GhostlyCommunion extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Move Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            target: {
                activePromptTitle: 'Choose a location to move your dude to',
                waitingPromptTitle: 'Waiting for opponent to choose a location',
                cardCondition: {   
                    location: 'play area',
                    condition: card => card.hasKeyword('holy ground') || 
                        card.adjacentLocations().some(location => location.locationCard.hasKeyword('holy ground'))
                },
                cardType: 'location'
            },
            actionContext: { card: this.parent, gameAction: 'moveDude'},
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.moveDude({
                    card: this.parent,
                    targetUuid: context.target.gamelocation
                }));
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Join Posse',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            actionContext: { card: this.parent, gameAction: 'joinPosse' },
            condition: () => this.game.getShootoutLocationCard().hasKeyword('holy ground') || 
                this.game.getShootoutLocationCard().adjacentLocations().some(location => location.locationCard.hasKeyword('holy ground')),
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.setAsStud()
                    ]
                }));
                this.game.addMessage('{0} uses {1} to move {2} and have them join the posse and make them a stud', context.player, this, this.parent);
            },
            source: this
        });
    }
}

GhostlyCommunion.code = '17017';

module.exports = GhostlyCommunion;
