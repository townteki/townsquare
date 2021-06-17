const DudeCard = require('../../dudecard.js');

class GabrielPrior extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.usedBy === this.uuid &&
                    event.props.source.hasKeyword('miracle')
            },
            handler: context => {
                this.lastingEffect(ability => ({
                    until: {
                        [onPullSuccess || onPullFail]
                    },
                    match: this,
                    effect: ability.effects.modifySkillRating('blessed', this.getSkillBonus())
                }));
            }
        });
    }

    getSkillBonus() {
        return this.game.getDudesAtLocation(this.gamelocation).filter(dude => dude.controller === this.controller && dude !== this).length;
    }
}

GabrielPrior.code = '22007';

module.exports = GabrielPrior;
