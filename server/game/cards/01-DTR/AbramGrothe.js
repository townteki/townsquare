const DudeCard = require('../../dudecard.js');

class AbramGrothe extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Abram Grothe',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a deed',
                cardCondition: card => card.location === 'play area' && card.hasKeyword('holy ground'),
                cardType: ['deed']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to lead a job to discard all Abominations and wanted dudes at {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                const dudes = this.game.getDudesAtLocation(job.mark.gamelocation).filter(dude => dude.isWanted() || dude.hasKeyword('abomination'));
                if(dudes.length) {
                    context.player.discardCards(dudes);
                }
            }
        });
    }
}

AbramGrothe.code = '01023';

module.exports = AbramGrothe;
