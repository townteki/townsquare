const DudeCard = require('../../dudecard.js');

class DrDelphiWallis extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Dr. Delphi Wallis',
            playType: ['shootout'],
            cost: ability.costs.boot(card => card === this || 
                (card.isGadget() && card.parent === this)
            ),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true 
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                const skillRating = this.getSkillRating('mad scientist');
                context.player.pullForSkill(context.target.getGrit(context), skillRating, {
                    successHandler: context => {
                        this.context = context;
                        const abilities = context.target.abilities.actions.concat(context.target.abilities.reactions).filter(ability => ability.printed);
                        if(abilities.length === 0) {
                            this.game.addMessage('{0} uses {1} on {2}, but they do not have any printed ability', context.player, this, context.target);
                            return;
                        }
                        if(abilities.length > 1) {
                            const buttons = abilities.map(ability => {
                                return { text: ability.title, arg: ability.title, method: 'blankAbility' };
                            });
                            this.game.promptWithMenu(context.player, this, {
                                activePrompt: {
                                    menuTitle: 'Select ability to blank',
                                    buttons: buttons
                                },
                                source: this
                            });
                        } else {
                            this.context.defaultAbility = true;
                            this.blankAbility(context.player, abilities[0].title);
                        }
                    },
                    pullingDude: this,
                    source: this
                }, context);
            }
        });
    }

    blankAbility(player, arg) {
        this.untilEndOfRound(this.context.ability, ability => ({
            match: this.context.target,
            effect: ability.effects.cannotTriggerCardAbilities(ability => ability.title === arg)
        }));
        if(this.context.defaultAbility) {
            this.game.addMessage('{0} uses {1} on {2} to blank their ability', player, this, this.context.target);
        } else {
            this.game.addMessage('{0} uses {1} on {2} to blank "{3}" ability', player, this, this.context.target, arg);
        }
    }
}

DrDelphiWallis.code = '22010';

module.exports = DrDelphiWallis;
