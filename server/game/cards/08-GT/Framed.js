const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Framed extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Framed: Initial bounty',
            playType: ['noon'],
            cost: ability.costs.payGhostRock(context => context.target.influence, false,
                context => this.minOppInf(context)),
            target: {
                activePromptTitle: 'Select opposing dude to frame',
                cardCondition: { location: 'play area', controller: 'opponent'},
                cardType: ['dude']
            },
            handler: context => {
                const vBoss = context.target.controller;
                const bountify = () =>
                    this.game.resolveGameAction(GameActions.addBounty({ card: context.target}), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to add 1 bounty to {2}', context.player, this, context.target);
                    });
                if(vBoss.getSpendableGhostRock() < 1) {
                    bountify();
                } else {
                    context.game.promptForYesNo(vBoss, {
                        title: `Do you want to pay 1 GR to ${context.player.name} and boot ${context.target.title} to prevent 1 bounty?`,
                        onYes: () => {
                            this.game.transferGhostRock({
                                from: vBoss,
                                to: context.player,
                                amount: 1
                            });
                            if(context.target.booted) {
                                this.game.addMessage('{0} uses {1} on {2}, {3} pays them 1 GR to prevent the bounty', context.player, this, context.target, vBoss);
                            } else {
                                this.game.resolveGameAction(GameActions.bootCard({ card: context.target}), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} on {2}, {3} pays them 1 GR and boots {2} to prevent the bounty', context.player, this, context.target, vBoss);
                                });
                            }
                        },
                        onNo: () => bountify(),
                        source: this
                    });
                }
            }
        });

        this.action({
            title: 'Framed: 3 more bounty',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select opposing wanted dude',
                cardCondition: { location: 'play area', controller: 'opponent', wanted: true},
                cardType: ['dude'],
                gameAction: ['addBounty']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2} to further increase their bounty by 3',
                context.player, this, context.target),
            handler: context => this.game.resolveGameAction(GameActions.addBounty({ card: context.target, amount: 3}), context)
        });
    }

    minOppInf(context) {
        if(this.game.getNumberOfPlayers() === 1) {
            return 0;
        }
        return this.game.getDudesInPlay(context.player.getOpponent()).reduce((minInf, dude) => {
            if(dude.influence > minInf) {
                return minInf;
            }
            return dude.influence;
        }, 999);
    }
}

Framed.code = '14037';

module.exports = Framed;
