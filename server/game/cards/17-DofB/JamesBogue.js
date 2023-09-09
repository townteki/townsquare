const DudeCard = require('../../dudecard.js');

class JamesBogue extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'React: James Bogue',
            when: {
                onTakenCasualties: event => this.isParticipating() && 
                    this.controller.equals(event.player) && event.casualtiesTaken.length
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give him +1 bullets', context.player, this),
            handler: context => {
                this.untilEndOfShootoutPhase(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(1)
                }));                
            }
        });
    }
}

JamesBogue.code = '25026';

module.exports = JamesBogue;
