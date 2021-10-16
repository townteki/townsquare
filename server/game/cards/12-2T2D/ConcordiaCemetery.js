const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ConcordiaCemetery extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Concordia Cemetery',
            triggerBefore: true,
            when: {
                onCardAced: event => event.card.getType() === 'dude' &&
                    event.card.controller !== this.controller &&
                    event.card.isParticipating() &&
                    !event.card.isToken()
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.modifyProduction(1);
                let addControlText = '';
                if(context.event.card.getGrit(context) >= 11) {
                    this.modifyControl(1);
                    addControlText += ' and +1 permanent CP';
                }
                this.game.addMessage('{0} uses {1} to give it +1 permanent production{2}', 
                    context.player, this, addControlText);
            }
        });
    }
}

ConcordiaCemetery.code = '20033';

module.exports = ConcordiaCemetery;
