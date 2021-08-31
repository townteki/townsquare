const DudeCard = require('../../dudecard.js');

class GabrielPrior extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.pullingDude && event.props.source &&
                    event.props.pullingDude === this &&
                    event.props.source.hasKeyword('miracle')
            },
            handler: context => {
                const saveEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    if(event.value) {
                        event.value += this.getSkillBonus();
                    } else {
                        event.value = this.getSkillBonus();
                    }
                    saveEventHandler(event);
                });
            }
        });
    }

    getSkillBonus() {
        return this.game.getDudesAtLocation(this.gamelocation).filter(dude => dude.controller === this.controller && dude !== this).length;
    }
}

GabrielPrior.code = '22007';

module.exports = GabrielPrior;
