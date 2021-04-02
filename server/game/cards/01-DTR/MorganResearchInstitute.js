const DeedCard = require('../../deedcard.js');

class MorganResearchInstitute extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Morgan Research Institute',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select skilled dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.locationCard === this && 
                        card.isSkilled() &&
                        (card.allowGameAction('increaseSkill') || card.allowGameAction('decreaseSkill'))
                }, 
                cardType: ['dude']
            },
            handler: context => {
                this.abilityContext = context;
                // Handle case when dude has more then one skill
                let skills = this.abilityContext.target.getSkills();
                if(skills.length > 1) {
                    let buttons = skills.map(skill => {
                        return { text: skill.charAt(0).toUpperCase() + skill.slice(1), arg: skill, method: 'selectSkill' };
                    });
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Select skill',
                            buttons: buttons
                        },
                        source: this
                    });
                } else {
                    this.selectSkill(context.player, skills[0]);
                }
            }
        });
    }

    selectSkill(player, skill) {
        this.game.promptWithMenu(player, this, {
            activePrompt: {
                menuTitle: `Raise or lower ${skill.charAt(0).toUpperCase() + skill.slice(1)} skill?`,
                buttons: [
                    { 
                        text: 'Raise by 2', 
                        arg: skill, 
                        method: 'raise',
                        disabled: !this.abilityContext.target.allowGameAction('increaseSkill')
                    },
                    { 
                        text: 'Lower by 2', 
                        arg: skill, 
                        method: 'lower',
                        disabled: !this.abilityContext.target.allowGameAction('decreaseSkill')
                    }
                ]
            },
            source: this
        });
        return true;
    }

    raise(player, skill) {
        this.applySkillEffects(player, 2, skill);
        return true;
    }

    lower(player, skill) {
        this.applySkillEffects(player, -2, skill);
        return true;
    }

    applySkillEffects(player, amount, skill) {
        let text = 'raise';
        if(amount < 0) {
            text = 'lower';
        }
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: [
                ability.effects.modifySkillRating(skill, amount, true)
            ]
        }));
        this.game.addMessage('{0} uses {1} to {2} {3}\'s {4} skill rating by 2 to current skill level of {5}', 
            player, 
            this, 
            text, 
            this.abilityContext.target, skill.charAt(0).toUpperCase() + skill.slice(1), 
            this.abilityContext.target.getSkillRating(skill, true));
    }
}

MorganResearchInstitute.code = '01072';

module.exports = MorganResearchInstitute;
