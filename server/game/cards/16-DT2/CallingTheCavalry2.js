const ActionCard = require('../../actioncard.js');

class CallingTheCavalry2 extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Calling the Cavalry',
            playType: ['shootout'],
            message: context => this.game.addMessage('{0} uses {1} to give both players +1 hand rank for each Horse in their posse', context.player, this),
            handler: context => {
                let eventHandler = () => {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutRoundFinished: () => true
                        },
                        condition: () => this.game.shootout && this.playerWithMostHorses(),
                        match: this.playerWithMostHorses(),
                        effect: ability.effects.modifyHandRankMod(1)
                    }));
                };
                this.game.onceConditional('onPlayWindowOpened', { condition: event => event.playWindow.name === 'shootout resolution' }, eventHandler);
                this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onPlayWindowOpened', eventHandler));
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && card.controller === context.player && card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: card,
                            effect: ability.effects.setAsStud()
                        }));
                        this.game.addMessage('{0} uses {1} to set {2} as stud', player, this, card);
                        return true;
                    }
                });
            }
        });
    }

    getNumberOfMountsForPlayer(player) {
        let playerPosse = this.game.shootout.getPosseByPlayer(player);
        if(playerPosse) {
            return playerPosse.getDudes(dude => dude.hasHorse()).length;
        }
        return 0;
    }

    playerWithMostHorses() {
        const players = this.game.getPlayers();
        if(players.length < 2) {
            return;
        }
        let horseNumbers = players.map(player => { 
            return { 
                player, 
                horses: this.getNumberOfMountsForPlayer(player) 
            };
        });
        let sorted = horseNumbers.sort((a, b) => b.horses - a.horses);
        if(sorted[0].horses === sorted[1].horses) {
            return;
        }
        return sorted[0].player;
    }
}

CallingTheCavalry2.code = '24230';

module.exports = CallingTheCavalry2;
