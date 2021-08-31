const DudeCard = require('../../dudecard.js');

class TakahashiJinrai extends DudeCard {
    setupCardAbilities() {
        this.job({
            title: 'Takahashi Jinrai',
            playType: 'noon',
            target: {
                activePromptTitle: 'Mark an in-town deed',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.owner === this.controller &&
                        !card.isOutOfTown() &&
                        card.cost - card.production >= 2 
                },
                cardType: ['deed']
            },
            message: context => this.game.addMessage('{0} uses {1} marking {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                job.mark.modifyProduction(1);
                this.game.addMessage('{0} increases production by 1 on {1} thanks to {2}\'s job', context.player, job.mark, this);
            }
        });
    }
}

TakahashiJinrai.code = '20022';

module.exports = TakahashiJinrai;
