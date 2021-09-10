const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SheriffEliWaters extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.isParticipating(),
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getEliBonus())
        });

        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                this.game.promptForYesNo(context.player, {
                    title: `Do you want to move ${this.title}?`,
                    onYes: player => {
                        context.ability.selectAnotherTarget(player, context, {
                            activePromptTitle: 'Select a wanted dude to move to',
                            waitingPromptTitle: 'Waiting for opponent to select wanted dude',
                            cardCondition: card => card.location === 'play area' && 
                                card.isWanted(),
                            cardType: 'dude',
                            onSelect: (player, card) => {
                                this.game.resolveGameAction(GameActions.moveDude({ card: this, targetUuid: card.gamelocation }), context).thenExecute(() => {
                                    if(this.game.shootout && card.getGameLocation() === this.game.shootout.shootoutLocation) {
                                        this.game.promptForYesNo(player, {
                                            title: `Do you want ${this.title} to join posse?`,
                                            onYes: player => {
                                                this.game.resolveGameAction(GameActions.joinPosse({ card: this }), context).thenExecute(() => {
                                                    this.game.addMessage('{0} moves {1} to {2}\'s location and joins the shootout as a result of his trait', player, this, card);
                                                });                                                
                                            },
                                            onNo: player => {
                                                this.game.addMessage('{0} moves {1} to {2}\'s location as a result of his trait', player, this, card);
                                            },
                                            source: this
                                        });
                                    } else {
                                        this.game.addMessage('{0} moves {1} to {2}\'s location as a result of his trait', player, this, card);
                                    }
                                });
                                return true;
                            },
                            source: this
                        });
                    },
                    source: this
                });
            }
        });
    }

    getEliBonus() {
        const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!oppPosse) {
            return 0;
        }
        const maxBounty = oppPosse.getDudes().reduce((max, dude) => dude.bounty > max ? dude.bounty : max, 0);
        return maxBounty > 4 ? 4 : maxBounty;
    }
}

SheriffEliWaters.code = '19012';

module.exports = SheriffEliWaters;
