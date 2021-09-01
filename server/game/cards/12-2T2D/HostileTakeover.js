const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class HostileTakeover extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Hostile Takeover',
            playType: ['noon'],
            cost: ability.costs.boot(card =>
                card.controller === this.owner &&
                card.location === 'play area' &&
                card.locationCard.owner !== this.owner &&
                card.getType() === 'dude' &&
                card.isStud()
            ),
            handler: context => {
                const costDude = context.costs.boot;
                this.game.resolveGameAction(GameActions.bootCard({ 
                    card: costDude.locationCard 
                }), context).thenExecute(() => {
                    const gainedGR = costDude.bullets > 3 ? 3 : costDude.bullets;
                    context.player.modifyGhostRock(gainedGR);
                    this.game.addMessage('{0} uses {1} and boots {2} to gain {3} GR', 
                        context.player, this, costDude, gainedGR);
                    this.game.promptForYesNo(context.player, {
                        title: 'Do you want to ace this card?',
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.aceCard({ card: this }), context)
                                .thenExecute(() => {
                                    if(costDude.locationCard) {
                                        costDude.locationCard.modifyControl(1);
                                    }
                                    costDude.modifyInfluence(1);
                                    this.game.addMessage('{0} aces {1} to give 1 CP to {2} and 1 permanent influence to {3}', 
                                        player, this, costDude.locationCard, costDude);
                                });
                        },
                        source: this
                    });
                });
            }
        });
    }
}

HostileTakeover.code = '20050';

module.exports = HostileTakeover;
