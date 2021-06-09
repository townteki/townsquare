const ActionCard = require('../../actioncard.js');

class FallenStar extends ActionCard {
    setupCardAbilities(ability) {
        // TODO Faster on the Draw
        this.reaction({
            triggerBefore: true,
            title: 'Fallen Star',
            when: {
                onTargetsChosen: event => event.ability.context && event.ability.context.player !== this.owner &&
                    event.ability.playTypePlayed() === 'shootout' &&
                    event.targets.anySelection(selection => (
                        selection.choosingPlayer !== this.controller &&
                        selection.value.getType() === 'dude' &&
                        selection.value.controller === this.controller
                    ))
            },
            cost: [ability.costs.bootSelf()],
            target: {
                cardCondition: (card, context) => this.isEligibleCharacter(card, context)
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to choose {2} as the target for {3} instead', 
                    context.player, this, context.target, context.event.ability.card),
            handler: context => {
                context.replaceHandler(event => {
                    event.targets.selections[0].resolve(context.target);
                });                                    
            }
        });
    }

    isEligibleTarget(card, context) {
        let selection = context.event.targets.selections[0];
        return (
            selection.isEligible(card) &&
            card.controller === this.controller &&
            card.getType() === 'dude'
        );
    }
}

FallenStar.code = '23053';

module.exports = FallenStar;
