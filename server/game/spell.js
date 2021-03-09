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
                cardCondition: card => possibleCasters.include(card),
                onSelect: (player, card) => {
                    context.caster = card;
                    this.castSpell(context, abilityHandler);
                    return true;
                }
            });
        }
    }

    castSpell(context, abilityHandler = () => true) {
        if(context.target) {
            this.ability.game.addMessage('{0} attempts to cast {1} on {2}', context.player, this.ability.card, context.target);
        } else {
            this.ability.game.addMessage('{0} attempts to cast {1}', context.player, this.ability.card);
        }
        abilityHandler(context);
        let finalDifficulty = this.difficulty;
        if(typeof(this.difficulty) === 'function') {
            finalDifficulty = this.difficulty(context);
        }
        context.difficulty = finalDifficulty;
        context.totalPullValue = context.caster.getSkillRatingForCard(this.ability.card);
        context.player.pullForSkill(finalDifficulty, context.totalPullValue, {
            successHandler: pulledCard => {
                context.pulledCard = pulledCard;
                this.onSuccess(context);
            },
            failHandler: pulledCard => {
                context.pulledCard = pulledCard;
                this.onFail(context);
            },
            pullingDude: context.caster,
            source: this.ability.card
        });
    }

    canBeCasted(player) {
        return player.cardsInPlay.find(card => 
            card.getType() === 'dude' &&
            card.canCastSpell(this.ability.card)
        );
    }
}

module.exports = Spell;
