const SpellCard = require('../../spellcard.js');

class SwordOfTheSpirit extends SpellCard {
    setupCardAbilities() {
        this.spellAction({
            title: 'Sword of the Spirit',
            playType: 'noon',
            difficulty: 7,
            onSuccess: (context) => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Choose a dude',
                    waitingPromptTitle: 'Waiting for opponent to choose a dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller &&
                        card.hasAttachmentWithKeywords(['melee', 'weapon']),
                    cardType: 'dude',
                    onSelect: (player, dudeWithWeapon) => {
                        this.game.promptForSelect(player, {
                            activePromptTitle: 'Select a melee weapon',
                            waitingPromptTitle: 'Waiting for opponent to select melee weapon',
                            cardCondition: card => card.location === 'play area' &&
                                card.parent && card.parent === dudeWithWeapon &&
                                card.hasAllOfKeywords(['melee', 'weapon']),
                            cardType: 'goods',
                            autoSelect: true,
                            onSelect: (player, weapon) => {
                                this.applyAbilityEffect(context.ability, ability => ({
                                    condition: () => !!weapon.parent && weapon.parent === dudeWithWeapon,
                                    match: card => card.equals(dudeWithWeapon),
                                    effect: [
                                        ability.effects.modifyBullets(1),
                                        ability.effects.setAsStud(),
                                        ability.effects.cannotBeAffected('opponent', context => context.source && context.source.getType() === 'spell')
                                    ]
                                }));  
                                this.game.addMessage('{0} uses {1} to bless {2}\'s weapon. While they have {3}, they have +1 bullets, ' +
                                    'become a stud, and cannot be affected by opposing spells', player, this, dudeWithWeapon, weapon);                             
                                return true;
                            }
                        });
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

SwordOfTheSpirit.code = '08018';

module.exports = SwordOfTheSpirit;
