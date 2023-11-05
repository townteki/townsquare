const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HowlingHowellMelton extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Call out a dude',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Dude to call out',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.canBeCalledOut() && card.isInSameLocation(this) 
                },
                cardType: ['dude'],
                gameAction: 'callout'
            },
            handler: context => {
                let canReject = false;
                if(context.target.controller.getSpendableGhostRock() > 0) {
                    this.game.promptForYesNo(context.target.controller, {
                        title: 'Do you want to pay 1 GR to be able to refuse call out?',
                        onYes: player => {
                            player.spendGhostRock(1);
                            canReject = true;
                        },
                        source: this
                    });
                }
                this.game.queueSimpleStep(() => {               
                    this.game.resolveGameAction(GameActions.callOut({ caller: this, callee: context.target, canReject }), context).thenExecute(() => {
                        const rejectText = canReject ? 'who paid 1 GR to be able to reject' : '';
                        this.game.addMessage('{0} uses {1} to call out {2} {3}', context.player, this, context.target, rejectText);
                        let dudeAced = false;
                        const dudeAceEventHandler = event => {
                            if(event.card.getType() === 'dude' && event.fromPosse) {
                                dudeAced = true;
                            }
                        };
                        this.game.once('onCardAced', dudeAceEventHandler);     
                        const casualtyEventHandler = () => {
                            this.game.resolveGameAction(GameActions.decreaseCasualties({ player: context.player, amount: 2 }), context);
                            this.game.resolveGameAction(GameActions.decreaseCasualties({ player: context.target.controller, amount: 2 }), context);
                            this.game.addMessage('{0} uses {1} to call out {2} {3}', context.player, this, context.target, rejectText);
                        };
                        this.game.once('onShootoutCasualtiesStepStarted', casualtyEventHandler);
                        this.game.once('onShootoutPhaseStarted', () => {
                            this.lastingEffect(context.ability, ability => ({
                                until: {
                                    onShootoutPhaseFinished: () => true
                                },
                                match: this.game.shootout,
                                effect: ability.effects.cannotBringDudesIntoPosseByShootout()
                            }));
                            this.lastingEffect(context.ability, ability => ({
                                until: {
                                    onShootoutPossesGathered: () => true,
                                    onShootoutPhaseFinished: () => true,
                                    onDudeRejectedCallOut: () => true
                                },
                                match: this.game.getPlayers(),
                                effect: ability.effects.otherDudesCannotJoin()
                            }));                         
                        });
                        this.game.once('onShootoutRoundFinished', () => {
                            this.game.removeListener('onCardAced', dudeAceEventHandler);
                            this.game.removeListener('onShootoutCasualtiesStepStarted', casualtyEventHandler);
                            if(!dudeAced && this.game.shootout.winner) {
                                this.game.addMessage('{0} gets 2 GR because he is winner of {1}\'s shootout and no dudes were aced', 
                                    this.game.shootout.winner, this);
                                this.game.shootout.winner.modifyGhostRock(2);
                            }
                            this.game.shootout.cancelled = true;
                        });                    
                    });
                });
            }
        });
    }
}

HowlingHowellMelton.code = '25007';

module.exports = HowlingHowellMelton;
