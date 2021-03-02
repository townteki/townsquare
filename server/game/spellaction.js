const CardAction = require('./cardaction.js');
const HandlerGameActionWrapper = require('./GameActions/HandlerGameActionWrapper.js');

class SpellAction extends CardAction {
    constructor(game, card, properties) {
        super(game, card, properties);
        this.difficulty = properties.difficulty;
        this.onSuccess = properties.onSuccess;
        if(!this.onSuccess) {
            throw new Error('Spell Actions must have a `onSuccess` property.');
        }
        this.onFail = properties.onFail || (() => true);
        if(this.card.getType() !== 'spell') {
            throw new Error('This is not a spell card!');
        }
        if(!this.gameAction) {
            this.gameAction = new HandlerGameActionWrapper({ handler: () => true });
        }
    }

    meetsRequirements(context) {
        if(super.meetsRequirements(context)) {
            return this.canBeCasted(context.player);
        }
        return false;
    }

    executeHandler(context) {
        let possibleCasters = context.player.cardsInPlay.filter(card => 
            card.location === 'play area' &&
            card.getType() === 'dude' &&
            card.canCastSpell(this.card)
        );
        if(possibleCasters.length === 1) {
            context.caster = possibleCasters[0];
            this.castSpell(context);
        } else {
            this.game.promptForSelect(context.player, {
                activePromptTitle: 'Select spell caster for ' + this.card.title,
                context: context,
                cardCondition: card => possibleCasters.include(card),
                onSelect: (player, card) => {
                    context.caster = card;
                    this.castSpell(context);
                    return true;
                }
            });
        }
    }

    castSpell(context) {
        super.executeHandler(context);
        let finalDifficulty = this.difficulty;
        if(typeof(this.difficulty) === 'function') {
            finalDifficulty = this.difficulty(context);
        }
        context.player.pullForSkill(finalDifficulty, context.caster.getSkillRatingForCard(this.card), {
            successHandler: pulledCard => {
                context.pulledCard = pulledCard;
                this.onSuccess(context);
            },
            failHandler: pulledCard => {
                context.pulledCard = pulledCard;
                this.onFail(context);
            },
            pullingDude: context.caster,
            source: this.card
        });
    }

    canBeCasted(player) {
        return player.cardsInPlay.find(card => 
            card.getType() === 'dude' &&
            card.canCastSpell(this.card)
        );
    }
}

module.exports = SpellAction;
