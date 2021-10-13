const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class PlasmaDrill extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Plasma Drill',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1),
                ability.costs.bootParent()
            ],
            target: {
                activePromptTitle: 'Select deed to drill with plasma',
                cardCondition: { location: 'play area', controller: 'any', condition: card =>
                    this.parent && card.isAdjacent(this.parent.gamelocation)
                },
                cardType: ['deed'],
                gameAction: 'discard'
            },
            handler: context => {
                const thestakes = context.target.currentProduction;
                const theowner = context.target.owner;
                if(thestakes > 0) {
                    const plasmatizeIt = () => 
                        this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1}\'s {2} to turn {3} to slag', context.player, this.parent, this, context.target);
                        });
                    if(theowner.getSpendableGhostRock() >= thestakes) {
                        context.game.promptForYesNo(theowner, {
                            title: `Do you want to pay ${thestakes} GR to save ${context.target.title}?`,
                            onYes: () => {
                                theowner.spendGhostRock(thestakes);
                                this.game.addMessage('{0} uses {1}\'s {2} on {3}, {4} pays {5} GR to save it', 
                                    context.player, this.parent, this, context.target, theowner, thestakes);
                            },
                            onNo: () => plasmatizeIt(),
                            source: this
                        });
                    } else {
                        plasmatizeIt();
                    }
                } else {
                    this.game.addMessage('{0} uses {1} on {2} for no discernible reason', context.player, this, context.target);
                }
            }
        });
    }
}

PlasmaDrill.code = '02015';

module.exports = PlasmaDrill;
