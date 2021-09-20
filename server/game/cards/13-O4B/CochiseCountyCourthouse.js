const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class CochiseCountyCourthouse extends DeedCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Cochise County Courthouse',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: 'townsquare',
            posseCondition: (job, posseSelection) =>
                job.leader.bullets + posseSelection.reduce((agg, dude) => agg + dude.bullets, 0) >= 4,
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to convict',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== context.player &&
                        card.influence <= context.player.getSpendableGhostRock(),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        if(dude.attachments.length > 0) {
                            player.bootCards(dude.attachments, context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to boot attachments on {2}', player, this, dude);
                            });
                        }
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: dude, 
                            targetUuid: this.game.townsquare.uuid, 
                            options: { needToBoot: true }
                        }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to move {2} to Town Square booted', player, this, dude);
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

CochiseCountyCourthouse.code = '21042';

module.exports = CochiseCountyCourthouse;
