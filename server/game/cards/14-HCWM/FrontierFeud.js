const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class FrontierFeud extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Noon: Frontier Feud',
            playType: ['noon'],
            condition: () => this.game.getNumberOfPlayers() > 1, 
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    booted: false,
                    condition: card => !card.isInOutOfTown() &&
                        !card.isInTownSquare()
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.abilityContext = context;
                this.game.resolveGameAction(GameActions.moveDude({
                    card: context.target,
                    targetUuid: this.game.townsquare.uuid,
                    options: {
                        needToBoot: true
                    }
                }), context).thenExecute(() => {
                    this.game.promptWithMenu(context.player.getOpponent(), this, {
                        activePrompt: {
                            menuTitle: 'Make your choice',
                            buttons: [
                                { text: `Give 1 CP to ${context.target.title}`, method: 'giveCP' },
                                { 
                                    text: `Call out ${context.target.title}`, 
                                    method: 'calloutFeud', 
                                    disabled: this.isCalloutDisabled(context.player.getOpponent()) 
                                }
                            ]
                        },
                        source: this
                    });
                });
            }
        });
    }

    isCalloutDisabled(player) {
        const intownDudes = player.cardsInPlay.filter(card => card.getType() === 'dude' && 
            !card.locationCard.isOutOfTown() && !card.isInTownSquare());
        return intownDudes.every(dude => !dude.allowGameAction('moveDude', this.abilityContext));
    }

    giveCP() {
        this.abilityContext.target.modifyControl(1);
        this.game.addMessage('{0} uses {1} and moves {2} to Town Square booted to give them 1 CP', 
            this.abilityContext.player, this, this.abilityContext.target);
        return true;
    }

    calloutFeud() {
        const opponent = this.abilityContext.player.getOpponent();
        this.abilityContext.ability.selectAnotherTarget(opponent, this.abilityContext, {
            activePromptTitle: 'Select a dude for call out',
            waitingPromptTitle: 'Waiting for opponent to select dude',
            cardCondition: card => card.location === 'play area' &&
                card.controller !== this.owner &&
                !card.isInOutOfTown() &&
                !card.isInTownSquare(),
            cardType: 'dude',
            gameAction: 'moveDude',
            onSelect: (player, oppDude) => {
                this.game.resolveGameAction(GameActions.moveDude({
                    card : oppDude,
                    targetUuid: this.game.townsquare.uuid
                }), this.abilityContext).thenExecute(() => {
                    this.lastingEffect(this.abilityContext.ability, ability => ({
                        until: {
                            onShootoutPossesGathered: () => true,
                            onShootoutPhaseFinished: () => true,
                            onDudeRejectedCallOut: () => true
                        },
                        match: this.game.getPlayers(),
                        effect: ability.effects.otherDudesCannotJoin()
                    }));
                    this.game.resolveGameAction(GameActions.callOut({ 
                        caller: oppDude,
                        callee: this.abilityContext.target
                    }), this.abilityContext).thenExecute(() => {
                        this.game.once('onShootoutPhaseStarted', () => {
                            this.lastingEffect(this.abilityContext.ability, ability => ({
                                until: {
                                    onShootoutPhaseFinished: () => true
                                },
                                match: this.game.shootout,
                                effect: ability.effects.cannotBringDudesIntoPosseByShootout()
                            }));
                        });
                        this.game.addMessage('{0} uses {1} and boots {2} to move them and {3} to Town Square and start a Shootout', 
                            this.abilityContext.player, this, this.abilityContext.target, oppDude);
                    });
                });
                return true;
            },
            source: this
        });
        return true;
    }
}

FrontierFeud.code = '22055';

module.exports = FrontierFeud;
