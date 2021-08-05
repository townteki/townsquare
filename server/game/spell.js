class Spell {
    constructor(spellAbility, properties) {
        this.ability = spellAbility;
        this.difficulty = properties.difficulty;
        this.onSuccess = properties.onSuccess;
        if(!this.onSuccess) {
            throw new Error('Spell Actions must have a `onSuccess` property.');
        }
        this.onFail = properties.onFail || (() => true);
        if(this.ability.card.getType() !== 'spell') {
            throw new Error('This is not a spell card!');
        }
    }

    executeSpell(context, abilityHandler) {
        let possibleCasters = context.player.cardsInPlay.filter(card => 
            card.location === 'play area' &&
            card.getType() === 'dude' &&
            card.canCastSpell(this.ability.card)
        );
        if(possibleCasters.length === 1) {
            context.caster = possibleCasters[0];
            this.castSpell(context, abilityHandler);
        } else {
            this.ability.game.promptForSelect(context.player, {
                activePromptTitle: 'Select spell caster for ' + this.ability.card.title,
                context: context,
                cardCondition: card => possibleCasters.includes(card),
                onSelect: (player, card) => {
                    context.caster = card;
                    this.castSpell(context, abilityHandler);
                    return true;
                }
            });
        }
    }

    castSpell(context, abilityHandler = () => true) {
        const skillRating = context.caster.getSkillRatingForCard(this.ability.card);
        if(context.target) {
            this.ability.game.addMessage('{0}\'s caster {1} attempts to cast {2} on {3} (using skill rating {4})', 
                context.player, context.caster, this.ability.card, context.target, skillRating);
        } else {
            this.ability.game.addMessage('{0}\'s caster {1} attempts to cast {2} (using skill rating {3})', 
                context.player, context.caster, this.ability.card, skillRating);
        }
        abilityHandler(context);
        let finalDifficulty = this.difficulty;
        if(typeof(this.difficulty) === 'function') {
            finalDifficulty = this.difficulty(context);
        }
        context.difficulty = finalDifficulty;
        context.player.pullForSkill(finalDifficulty, skillRating, {
            successHandler: context => this.onSuccess(context),
            failHandler: context => this.onFail(context),
            pullingDude: context.caster,
            source: this.ability.card
        }, context);
    }

    canBeCasted(player) {
        return player.cardsInPlay.find(card => 
            card.getType() === 'dude' &&
            card.canCastSpell(this.ability.card)
        );
    }
}

module.exports = Spell;
