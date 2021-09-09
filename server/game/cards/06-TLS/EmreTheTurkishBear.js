const DudeCard = require('../../dudecard.js');
const JokerPrompt = require('../../gamesteps/jokerprompt.js');

class EmreTheTurkishBear extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Emre, The Turkish Bear',
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.pullingDude !== this &&
                    event.props.pullingDude && event.props.source &&
                    event.props.pullingDude.gamelocation === this.gamelocation &&
                    event.props.source.hasKeyword('technique')
            },
            handler: context => {
                const saveEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    const originalCard = event.card;
                    event.card = context.player.pull(null, false, event.props);
                    this.game.addMessage('{0} uses {1} to replace the pulled {2}of{3}({4} ) with a new pull and make {1} a stud', 
                        context.player, this, originalCard.value, originalCard.suit, originalCard);
                    originalCard.owner.handlePulledCard(originalCard);
                    if(event.card.getType() === 'joker') {
                        this.game.queueStep(new JokerPrompt(this.game, event.card, (pulledCard, chosenValue, chosenSuit) => {
                            event.card = pulledCard;
                            event.suit = chosenSuit;
                            event.value = chosenValue;
                            saveEventHandler(event);
                        }));
                    } else {
                        saveEventHandler(event);
                    }
                });
                this.untilEndOfRound(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

EmreTheTurkishBear.code = '10005';

module.exports = EmreTheTurkishBear;
