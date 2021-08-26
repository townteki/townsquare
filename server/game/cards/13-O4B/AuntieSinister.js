const DudeCard = require('../../dudecard.js');

class AuntieSinister extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.isParticipating() && this.hasAttachmentWithKeywords('mystical'),
            match: this,
            effect: ability.effects.dynamicSkillRating('huckster', () => this.influence)
        });

        this.reaction({
            when: {
                onPullSuccess: event => event.source &&
                    event.pullingDude === this && event.pullingDude.isParticipating() && 
                        (event.context.totalPullValue - 6 >= event.source.difficulty) && event.source.getType() === 'spell' && event.source.isHex()
            },
            handler: context => {
                this.modifyBullets(2);
                this.game.addMessage('{0} uses {1} to give her +2 bullets', context.player, this);
            }
        });
    }
}

AuntieSinister.code = '21021';

module.exports = AuntieSinister;
