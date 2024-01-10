const ActionCard = require('../../actioncard.js');

class AllOrNothing extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'All Or Nothing',
            playType: 'noon',
            target: {
                activePromptTitle: 'Select location',
                cardCondition: { location: 'play area' },
                cardType: ['location']
            },
            message: context => this.game.addMessage('{0} plays {1} marking {2}.',
                this.owner, this, context.target),
            onSuccess: (job, context) => {
                let messg = "{0} uses {1}";
                const NofAtts = job.mark.attachments.length;
                if(NofAtts > 0) {
                    context.player.discardCards(job.mark.attachments, () => {
                        messg += " to discard " + NofAtts + " attachments";
                    }, { isCardEffect: true }, context);
                }
                if(['deed','townsquare'].includes(job.mark.getType())) {
                    const chasedDudes = job.mark.getDudes(dude => dude.isWanted() || dude.hasKeyword('abomination'));
                    const NofBadDudes = chasedDudes.length;
                    context.player.discardCards(chasedDudes, () => {
                        messg += (NofAtts?" and ":" to discard ") + NofBadDudes + " dudes from {2}";
                    }, { isCardEffect: true }, context);
                } else if(NofAtts > 0) {
                    messg += " from {2}";
                } else {
                    messg += " on {2} to no notable effect";
                }
                this.game.queueSimpleStep(() => {
                    this.game.addMessage(messg, this.owner, this, job.mark);
                });
            }
        });
    }
}

AllOrNothing.code = '17021';

module.exports = AllOrNothing;
