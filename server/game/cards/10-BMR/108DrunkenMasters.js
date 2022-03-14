const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DrunkenMasters extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.getType() === 'deed' &&
                (card.equals(card.owner.leftmostLocation().locationCard) ||
                card.equals(card.owner.rightmostLocation().locationCard)),
            effect: ability.effects.addKeyword('saloon')
        });

        this.reaction({
            title: 'React: 108 Drunken Masters',
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.player === this.owner &&
                    event.props.source &&
                    event.props.source.hasKeyword('technique')
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                const eventHandler = event => {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to put ${event.pulledCard.title} into your hand?`,
                        onYes: player => {
                            if(event.context.pull) {
                                // set the flag to prevent discarding of pulled card in abilityresolver
                                event.context.pull.doNotHandlePulledCard = true;
                            }
                            this.game.before('onPulledCardHandled', handleEvent => {
                                handleEvent.replaceHandler(() => true);
                            }, true, handleEvent => 
                                handleEvent.card === event.pulledCard && handleEvent.player === player);
                            player.moveCardWithContext(event.pulledCard, 'hand', context);
                            this.game.addMessage('{0} uses {1} to put pulled card {2} to their hand', 
                                player, this, event.pulledCard);    
                        },
                        source: this
                    });
                };
                const saveEventHandler = context.event.handler;
                context.replaceHandler(cardPullEvent => {
                    this.game.onceConditional('onPullSuccess', { 
                        condition: event => event.source === cardPullEvent.props.source &&
                            event.pullingDude === cardPullEvent.props.pullingDude &&
                            event.context.totalPullValue + 5 < event.difficulty
                    }, eventHandler);
                    const numOfSaloons = this.getNumOfSaloons();
                    if(cardPullEvent.value) {
                        cardPullEvent.value -= numOfSaloons;
                    } else {
                        cardPullEvent.value = -numOfSaloons;
                    }
                    this.game.addMessage('{0} uses {1} to reduce the {2}\'s pull by {3}', 
                        cardPullEvent.props.player, this, cardPullEvent.props.pullingDude, numOfSaloons);
                    saveEventHandler(cardPullEvent);
                });
                this.game.queueSimpleStep(() => { 
                    this.game.removeListener('onPullSuccess', eventHandler);
                }); 
            }
        });
    }

    getNumOfSaloons() {
        return this.game.findCardsInPlay(card => ['outfit', 'deed'].includes(card.getType()) &&
            card.controller === this.owner && card.hasKeyword('saloon')).length;
    }
}

DrunkenMasters.code = '18001';

module.exports = DrunkenMasters;
