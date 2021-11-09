const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ProfessorDuncanExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.locationCard && 
                this.locationCard.hasAttachmentWithKeywords(['totem']),
            match: this,
            effect: ability.effects.setAsStud()
        });

        this.reaction({
            title: 'React: "Professor" Duncan (Exp.1)',
            when: {
                onCardEntersPlay: event => event.card.getType() === 'spell' &&
                    event.card.hasKeyword('totem') &&
                    event.card.gamelocation === this.gamelocation &&
                    ['shoppin', 'ability'].includes(event.playingType) &&
                    !this.locationCard.hasAttachment(att => att !== event.card && att.title === event.card.title)
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to draw a card', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

ProfessorDuncanExp1.code = '23015';

module.exports = ProfessorDuncanExp1;
