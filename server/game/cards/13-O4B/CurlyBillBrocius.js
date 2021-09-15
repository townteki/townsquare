const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class CurlyBillBrocius extends DudeCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && 
                    this.controller.getTotalRank() > this.controller.getOpponent().getTotalRank()
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select your dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller,
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.addBounty({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} increases bounty on {1} thanks to {2}', player, card, this);
                        });
                        return true;
                    },
                    source: this
                });
            }
        });

        this.reaction({
            title: 'Curly Bill Brocius',
            when: {
                onShootoutCasualtiesStepStarted: () => this.isParticipating() && 
                    this.game.shootout.winner === this.controller &&
                    this.game.shootout.getPosseStat(this.controller, 'bounty') > this.game.shootout.getPosseStat(this.controller.getOpponent(), 'bounty')
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to increase {2}\'s casualties by 2', context.player, this, context.player.getOpponent()),
            handler: context => {
                context.player.getOpponent().modifyCasualties(2);
            }
        });
    }
}

CurlyBillBrocius.code = '21034';

module.exports = CurlyBillBrocius;
