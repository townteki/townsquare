const ActionCard = require('../../actioncard.js');
const CardSelector = require('../../CardSelector.js');
const GameActions = require('../../GameActions/index.js');

class FallenStar extends ActionCard {
    setupCardAbilities() {
        this.reaction({
            triggerBefore: true,
            title: 'Fallen Star',
            when: {
                onTargetsChosen: event => event.player !== this.owner &&
                    event.ability.playTypePlayed() === 'shootout' &&
                    (event.targets && event.targets.anySelection(selection => (
                        selection.choosingPlayer !== this.controller &&
                        selection.value.getType() === 'dude' &&
                        selection.value.controller === this.controller
                    )) || 
                    (event.cards && event.cards.some(card => card.getType() === 'dude')))
            },
            targets: {
                original: {
                    activePromptTitle: 'Select dude that was targeted',  
                    cardCondition: (card, context) => {
                        if(context.event.cards) {
                            return context.event.cards.includes(card);
                        }
                        return context.event.targets.getTargets().includes(card);
                    },
                    autoSelect: true
                },
                redirect: {
                    activePromptTitle: 'Select a target for redirection',
                    cardCondition: (card, context) => this.isEligibleTarget(card, context)
                }
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to choose {2} as the target for {3} instead', 
                    context.player, this, context.targets.redirect, context.targets.original),
            handler: context => {
                context.replaceHandler(event => {
                    if(event.targets) {
                        const selection = context.event.targets.selections.find(selection => selection.value === context.targets.original);
                        selection.resolve(context.targets.redirect);
                    }
                    if(event.cards) {
                        this.game.resolveGameAction(GameActions.bootCard({ card: context.targets.redirect }), context);
                        let index = event.cards.indexOf(context.targets.original);
                        event.cards[index] = context.targets.redirect;
                        event.properties.onSelect(context.player, event.cards);
                    }
                });                                    
            }
        });
    }

    isEligibleTarget(card, context) {
        if(card.controller !== this.controller || card.getType() !== 'dude') {
            return false;
        }
        if(context.event.cards) {
            const selector = context.event.properties.selector || CardSelector.for(context.event.properties);
            return !context.event.cards.includes(card) && selector.canTarget(card, context);
        }
        const selection = context.event.targets.selections.find(selection => selection.value === context.targets.original);
        return (
            selection.isEligible(card) &&
            card.controller === this.controller &&
            card.getType() === 'dude'
        );
    }
}

FallenStar.code = '23053';

module.exports = FallenStar;
