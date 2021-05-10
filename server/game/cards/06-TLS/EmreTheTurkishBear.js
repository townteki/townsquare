const DudeCard = require('../../dudecard.js');

class EmreTheTurkishBear extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Emre, The Turkish Bear',
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.usedBy !== this.uuid &&
                    event.props.pullingDude && event.props.source &&
                    event.props.pullingDude.gamelocation === this.gamelocation &&
                    event.props.source.hasKeyword('hex')
            },
            handler: context => {
                const saveEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    const originalCard = event.card;
                    event.props.usedBy = this.uuid;
                    event.card = context.player.pull(null, false, event.props);
                    this.game.addMessage('{0} uses {1} to replace the pulled {2}of{3}({4} ) with a new pull and make him a stud', 
                        context.player, this, originalCard.value, originalCard.suit, originalCard);
                    originalCard.owner.handlePulledCard(originalCard);
                    saveEventHandler(event);
                });
                this.untilEndOfRound(ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

EmreTheTurkishBear.code = '10005';

module.exports = EmreTheTurkishBear;
