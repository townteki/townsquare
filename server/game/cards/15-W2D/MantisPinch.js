const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MantisPinch extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Noon: Mantis Pinch',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a card with ability',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any',
                    condition: (card, context) => !context.kfDude ||
                        card.gamelocation === context.kfDude.gamelocation
                }
            },
            onSuccess: (context) => {
                this.mantisBlank(context);            
            },
            source: this
        });

        this.techniqueAction({
            title: 'Shootout: Mantis Pinch',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a card with ability',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any',
                    participating: true
                }
            },
            onSuccess: (context) => {
                this.mantisBlank(context);
            },
            source: this
        });
    }

    mantisBlank(context) {
        this.context = context;
        const abilities = context.target.abilities.actions.concat(context.target.abilities.reactions).filter(ability => ability.printed);
        if(abilities.length === 0) {
            this.game.addMessage('{0} uses {1} on {2}, but it/they do not have any printed ability', context.player, this, context.target);
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
    }

    blankAbility(player, arg) {
        this.untilEndOfRound(this.context.ability, ability => ({
            match: this.context.target,
            effect: ability.effects.cannotTriggerCardAbilities(ability => ability.title === arg)
        }));
        if(this.context.defaultAbility) {
            this.game.addMessage('{0} uses {1} on {2} to make their/its ability unusable', player, this, this.context.target);
        } else {
            this.game.addMessage('{0} uses {1} on {2} to make "{3}" ability unusable', player, this, this.context.target, arg);
        }
        return true;
    }    
}

MantisPinch.code = '23049';

module.exports = MantisPinch;
