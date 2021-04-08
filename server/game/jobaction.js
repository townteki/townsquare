const CardAction = require('./cardaction.js');

/**
 * Represents a job ability provided by card text.
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
 * limit        - the max number of uses for the repeatable action.
 * clickToActivate - boolean that indicates the action should be activated when
 *                   the card is clicked.
 * onSuccess    - function that will be executed if job succeeds. Uses parameters
 *                job (Shootout object) and context.
 * onFail       - function that will be executed if job fails. Uses parameters
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
            if(isSuccessful) {
                this.game.addMessage('{0} job marking {1} was successful.', this.card, job.mark);
                this.onSuccess(job, this.context);
            } else {
                this.game.addMessage('{0} job marking {1} has failed.', this.card, job.mark);
                this.onFail(job, this.context);
            }
        }
    }

    reset() {
        this.statusRecorded = false;
    }
}

module.exports = JobAction;
