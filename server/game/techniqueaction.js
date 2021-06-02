const CardAction = require('./cardaction.js');
const GameActions = require('./GameActions/index.js');

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
        if(properties.combo) {
            this.combo = properties.combo;
            this.options = this.options || {};
            this.options.doNotMarkActionAsTaken = true;
        }
    }

    meetsRequirements(context) {
        if(super.meetsRequirements(context)) {
            return this.canBePerformed(context);
        }
        return false;
    }

    executeHandler(context) {
        if(!context.kfDude) {
            return;
        }
        context.difficulty = context.kfDude.value > 13 ? 13 : context.kfDude.value;
        if(context.target) {
            this.game.addMessage('{0} attempts to perform {1} on {2} using {3} (with difficulty {4})', 
                context.player, this.card, context.target, context.kfDude, context.difficulty);
        } else {
            this.game.addMessage('{0} attempts to perform {1} using {2} (with difficulty {3})', 
                context.player, this.card, context.kfDude, context.difficulty);
        }
        super.executeHandler(context);
        context.player.pullForKungFu(context.difficulty, {
            successHandler: context => {
                this.onSuccess(context);
                if(this.combo) {
                    this.game.queueSimpleStep(() => {
                        if(this.combo(context)) {
                            this.performCombo(context);
                        } else {
                            this.game.markActionAsTaken(context);
                        }
                    });
                }
            },
            failHandler: context => {
                this.onFail(context);
                if(this.combo) {
                    this.game.queueSimpleStep(() => this.game.markActionAsTaken(context));                 
                }
            },
            pullingDude: context.kfDude,
            source: this.card
        }, context);
    }

    canBePerformed(context) {
        return context.comboNumber || this.game.getAvailableKfDudes(context).length > 0;
    }

    applyCostOnKfDude(context) {
        if(context.costs && context.costs.bootKfDude) {
            this.game.resolveGameAction(GameActions.bootCard({ card: context.kfDude }));
        }
    }

    resetKfOptions() {
        if(!this.options) {
            this.options = {};
        }
        this.options.kfDude = null;
    }

    canPayCosts(context) {
        if(this.options.kfDude) {
            context.kfDude = this.options.kfDude;
        }
        return super.canPayCosts(context);
    }

    resolveTargets(context) {
        if(this.options.kfDude) {
            context.kfDude = this.options.kfDude;
            this.applyCostOnKfDude(context);
        } else {
            let possibleKFDudes = this.game.getAvailableKfDudes(context, context.costs && context.costs.bootKfDude);
            if(possibleKFDudes.length === 1) {
                context.kfDude = possibleKFDudes[0];
                this.applyCostOnKfDude(context);
            } else {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select dude to perform technique',
                    context: context,
                    cardCondition: card => possibleKFDudes.includes(card),
                    onSelect: (player, card) => {
                        context.kfDude = card;
                        this.applyCostOnKfDude(context);
                        return true;
                    },
                    source: this.card
                });
            }
        }
        return super.resolveTargets(context);
    }

    performCombo(context) {
        if(!context.kfDude) {
            // this can happen if player cancels the technique on Kung Fu dude selection
            return;
        }
        context.comboNumber = context.comboNumber || 0;
        if(context.comboNumber < context.kfDude.getKungFuRating()) {
            this.game.promptForYesNo(context.player, {
                title: `Do you want to combo (${context.comboNumber + 1}.)?`,
                onYes: player => {
                    this.game.promptForSelect(player, {
                        activePromptTitle: 'Select a technique to combo',
                        waitingPromptTitle: 'Waiting for opponent to select technique',
                        cardCondition: card => ['hand', 'discard pile'].includes(card.location) && 
                            card.hasKeyword('technique') &&
                            card.code !== this.card.code &&
                            card.isSameTao(this.card) &&
                            card.hasEnabledCardAbility(player, { kfDude: context.kfDude, comboNumber: context.comboNumber }),
                        cardType: 'action',
                        onSelect: (player, card) => {
                            context.comboNumber += 1;
                            this.game.addMessage('{0} is performing a combo {1} by {2}', player, card, context.kfDude);
                            card.useAbility(player, { kfDude: context.kfDude, comboNumber: context.comboNumber });
                            return true;
                        },
                        onCancel: () => {
                            this.game.markActionAsTaken(context);
                        }
                    });
                },
                onNo: () => {
                    this.game.markActionAsTaken(context);
                }
            });  
        }      
    }
}

module.exports = TechniqueAction;
