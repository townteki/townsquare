const CardAction = require('./cardaction.js');

/** @typedef {import('./costs')} Costs */
/** @typedef {import('./AbilityTarget').AbilityTargetProperties} AbilityTargetProperties */
/** @typedef {import('./AbilityContext')} AbilityContext */
/** @typedef {import('./gamesteps/shootout')} Shootout */

/**
 * @typedef {Object} JobAbilityProperties
 * Represents a job ability provided by card text.
 *
 * Properties:
 * @property {string} title - string that is used within the card menu associated with this
 *                action.
 * @property {string | Array.<string>} playType - string or array of strings representing the type
 *                of action. For job it should always be `noon`.
 * @property {Function} condition - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * @property {Costs | Array.<Costs>} cost - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * @property {string} phase - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * @property {string | Array.<string>} location - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * @property {number} limit - the max number of uses for the repeatable action.
 * @property {boolean} clickToActivate - boolean that indicates the action should be activated when
 *                   the card is clicked.
 * @property {(job: Shootout, context: AbilityContext) => boolean} onSuccess - function that will be executed if job succeeds. Uses parameters
 *                job (Shootout object) and context.
 * @property {(job: Shootout, context: AbilityContext) => boolean} onFail - function that will be executed if job fails. Uses parameters
 *                job (Shootout object) and context.
 */
class JobAction extends CardAction {
    constructor(game, card, properties) {
        super(game, card, properties, true);
        this.onSuccess = properties.onSuccess;
        if(!this.onSuccess) {
            throw new Error('Job Actions must have a `onSuccess` property.');
        }
        this.onFail = properties.onFail || (() => true);
        this.statusRecorded = false;
        this.leaderCondition = properties.leaderCondition || (() => true);
        this.posseCondition = properties.posseCondition;
        if(this.posseCondition) {
            this.options.doNotMarkActionAsTaken = true;
        }
        this.isJob = true;
    }

    executeHandler(context) {
        let jobCard = context.ability.card;
        if(jobCard.getType() === 'dude' || (jobCard.parent && jobCard.parent.getType() === 'dude')) {
            let leader = jobCard.getType() === 'dude' ? jobCard : jobCard.parent;
            this.startJob(leader, context.target, context);
        } else if(context.costs && context.costs.bootLeader) {
            this.startJob(context.costs.bootLeader, context.target, context);
        } else {
            this.game.promptForSelect(context.player, {
                activePromptTitle: 'Select job leader',
                context: context,
                cardCondition: card => card.location === 'play area' &&
                    card.getType() === 'dude' &&
                    card.canLeadJob(context.player) &&
                    this.leaderCondition(card),
                onSelect: (player, card) => {
                    this.startJob(card, context.target, context);
                    return true;
                }
            });
        }
    }

    startJob(leader, mark, context) {
        this.context = context;
        super.executeHandler(context);
        this.game.startShootout(leader, mark, context);
    }

    setResult(isSuccessful, job) {
        if(!this.statusRecorded) {
            this.statusRecorded = true;
            if(job.cancelled) {
                this.game.addMessage('{0} job marking {1} was cancelled', this.card, job.mark);
                return;
            }
            if(isSuccessful) {
                this.game.raiseEvent('onJobSuccessful', { 
                    job, 
                    ability: this, 
                    context: this.context 
                }, event => {
                    this.game.addMessage('{0} job marking {1} was successful', event.ability.card, event.job.mark);
                    event.ability.onSuccess(event.job, event.context);
                });
            } else {
                this.game.raiseEvent('onJobFailed', { 
                    job, 
                    ability: this, 
                    context: this.context 
                }, event => {
                    this.game.addMessage('{0} job marking {1} has failed', event.ability.card, event.job.mark);
                    event.ability.onFail(event.job, event.context);
                });
            }
        }
    }

    reset() {
        this.statusRecorded = false;
    }
}

module.exports = JobAction;
