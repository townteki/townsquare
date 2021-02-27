const CardAction = require('./cardaction.js');

class JobAction extends CardAction {
    constructor(game, card, properties) {
        super(game, card, properties);
        this.onSuccess = properties.onSuccess;
        if(!this.onSuccess) {
            throw new Error('Job Actions must have a `onSuccess` property.');
        }
        this.onFail = properties.onFail || (() => true);
        this.statusRecorded = false;
        this.leaderCondition = properties.leaderCondition || (() => true);
        this.bootLeader = properties.bootLeader;
        this.isJob = true;
    }

    executeHandler(context) {
        let jobCard = context.ability.card;
        if(jobCard.getType() === 'dude' || (jobCard.parent && jobCard.parent.getType() === 'dude')) {
            let leader = jobCard.getType() === 'dude' ? jobCard : jobCard.parent;
            this.startJob(leader, context.target, context);
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
        if(this.bootLeader) {
            context.player.bootCard(leader);
        }
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
