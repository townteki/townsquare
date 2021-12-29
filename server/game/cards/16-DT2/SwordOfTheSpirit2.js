const SpellCard = require('../../spellcard.js');

class SwordOfTheSpirit2 extends SpellCard {
    setupCardAbilities() {
        this.spellAction({
            title: 'Sword of the Spirit',
            playType: 'noon',
            difficulty: 7,
            onSuccess: (context) => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose a dude',
                    waitingPromptTitle: 'Waiting for opponent to choose a dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller,
                    cardType: 'dude',
                    onSelect: (player, dudeWithWeapon) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: dudeWithWeapon,
                            effect: ability.effects.modifyBullets(1)
                        }));  
                        this.applyAbilityEffect(context.ability, ability => ({
                            condition: () => dudeWithWeapon.hasAttachmentWithKeywords(['melee', 'weapon']),
                            match: dudeWithWeapon,
                            effect: [
                                ability.effects.setAsStud(),
                                ability.effects.cannotBeAffected('opponent', context => context.source && context.source.getType() === 'spell')
                            ]
                        }));  
                        this.game.addMessage('{0} uses {1} to bless {2}\'s weapon to give them +1 bullets, ' +
                            'and while wielding the melee weapon, they become a stud, and cannot be affected by opposing spells', player, this, dudeWithWeapon);  
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

SwordOfTheSpirit2.code = '24200';

module.exports = SwordOfTheSpirit2;
