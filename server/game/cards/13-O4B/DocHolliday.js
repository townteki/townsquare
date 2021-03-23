const LegendCard = require('../../legendcard.js');

class DocHolliday extends LegendCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.game.shootout.leaderPlayer === this.owner && !this.isSpellcasterInLeaderPosse(),
            match: this.owner,
            effect: [
                ability.effects.modifyPosseStudBonus(-2)
            ]
        });
        this.action({
            title: 'Doc Holliday',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            targets: {
                receiver: {
                    activePromptTitle: 'Select dude to receive bonus',
                    cardCondition: { location: 'play area', participating: true },
                    cardType: ['dude']
                },
                spellcaster: {
                    activePromptTitle: 'Select spellcaster',
                    cardCondition: { location: 'play area', participating: true, condition: card => card.isSpellcaster() },
                    cardType: ['dude'],
                    autoSelect: true                    
                }
            },
            handler: context => {
                this.abilityContext = context;
                let skills = context.targets.spellcaster.getSkills(true);
                if(skills.length === 1) {
                    this.performDocMagic(context.player, skills[0]);
                } else {
                    let buttons = skills.map(skill => {
                        let buttonText = skill.charAt(0).toUpperCase() + skill.slice(1) + ' ' + 
                            context.targets.spellcaster.getSkillRating(skill);
                        return { text: buttonText, arg: skill, method: 'performDocMagic' };
                    });
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Select skill',
                            buttons: buttons
                        },
                        source: this
                    });
                }
            }
        });
    }

    performDocMagic(player, skillName) {
        let bulletBonus = this.abilityContext.targets.spellcaster.getSkillRating(skillName);
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.targets.receiver,
            effect: [
                ability.effects.modifyBullets(bulletBonus),
                ability.effects.setMaxBullets(4)
            ]
        }));
        this.game.addMessage('{0} uses {1} to give {2} bonus {3} bullets and sets their maximum bullets to 4', 
            player, this, this.abilityContext.targets.receiver, bulletBonus);
        return true;
    }

    isSpellcasterInLeaderPosse() {
        let leaderPosse = this.game.shootout.leaderPosse;
        if(leaderPosse) {
            let spellcasters = leaderPosse.getDudes(dude => dude.isSpellcaster());
            return spellcasters && spellcasters.length > 0;
        }
        //if there is no posse, we do not want penalty so return true
        return true;
    }
}

DocHolliday.code = '21007';

module.exports = DocHolliday;
