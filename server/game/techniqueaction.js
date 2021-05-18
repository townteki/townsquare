const CardAction = require('./cardaction.js');

/**
 * Represents a Technique ability provided by card text.
 *
 * Properties:
 * title        - string that is used within the card menu associated with this
 *                action.
 * condition    - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * cost         - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * phase        - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * location     - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * onSuccess    - function that will be executed if technique succeeds. Takes context
 *                as parameter. 
 * onFail       - function that will be executed if technique fails. Takes context
 *                as parameter.
 */
class TechniqueAction extends CardAction {
    constructor(game, card, properties) {
        super(game, card, properties);
        this.onSuccess = properties.onSuccess;
        if(!this.onSuccess) {
            throw new Error('Technique Actions must have a `onSuccess` property.');
        }
        this.onFail = properties.onFail || (() => true);
        if(this.card.getType() !== 'action') {
            throw new Error('This is not an action card!');
        }
    }

    meetsRequirements(context) {
        if(super.meetsRequirements(context)) {
            return this.canBePerformed(context.player);
        }
        return false;
    }

    executeHandler(context) {
        let possibleKFDudes = context.player.cardsInPlay.filter(card => 
            card.location === 'play area' &&
            card.getType() === 'dude' &&
            card.canPerformTechnique(this.card)
        );
        if(possibleKFDudes.length === 1) {
            context.kfDude = possibleKFDudes[0];
            this.performTechnique(context);
        } else {
            this.game.promptForSelect(context.player, {
                activePromptTitle: 'Select Kung Fu Dude for ' + this.card.title,
                context: context,
                cardCondition: card => possibleKFDudes.includes(card),
                onSelect: (player, card) => {
                    context.kfDude = card;
                    this.performTechnique(context);
                    return true;
                }
            });
        }
    }

    performTechnique(context) {
        const kfRating = context.kfDude.getKungFuRating();
        context.difficulty = context.kfDude.value + kfRating;
        context.difficulty = context.difficulty > 13 ? 13 : context.difficulty;
        if(context.target) {
            this.game.addMessage('{0} attempts to perform {1} on {2} using {3} (with difficulty {4})', 
                context.player, this.card, context.target, context.kfDude, context.difficulty);
        } else {
            this.game.addMessage('{0} attempts to perform {1} using {2} (with difficulty {3})', 
                context.player, this.card, context.kfDude, context.difficulty);
        }
        super.executeHandler(context);
        context.player.pullForKungFu(context.difficulty, {
            successHandler: context => this.onSuccess(context),
            failHandler: context => this.onFail(context),
            pullingDude: context.kfDude,
            source: this.card
        }, context);
    }

    canBePerformed(player) {
        return player.cardsInPlay.find(card => 
            card.getType() === 'dude' &&
            card.canPerformTechnique(this.card)
        );
    }
}

module.exports = TechniqueAction;
