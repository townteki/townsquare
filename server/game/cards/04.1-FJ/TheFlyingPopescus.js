const DudeCard = require('../../dudecard.js');

class TheFlyingPopescus extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.getAttachmentsByKeywords('hex').length >= 2,
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });

        this.action({
            title: 'The Flying Popescus',
            playType: ['shootout'],
            ifCondition: () => this.hasAttachmentWithKeywords('mystical'),
            ifFailMessage: context => this.game.addMessage('{0} uses {1} to no effect because no mystical goods is attached',
                context.player, this),
            message: context => this.game.addMessage('{0} has {1} become a stud', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                });
            }
        });
    }
}

TheFlyingPopescus.code = '06002';

module.exports = TheFlyingPopescus;
