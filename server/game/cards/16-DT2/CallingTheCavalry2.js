const ActionCard = require('../../actioncard.js');

class CallingTheCavalry2 extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Calling the Cavalry',
            playType: ['shootout'],
            message: context => 
                this.game.addMessage('{0} uses {1} to give player with the most Horses +1 hand rank', 
                    context.player, this),
            handler: context => {
                const eventHandler = () => {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onPlayWindowClosed: event => event.playWindow.name === 'shootout resolution',
                            onShootoutRoundFinished: () => true
                        },
                        condition: () => this.game.shootout && this.playerWithMostHorses(),
                        match: this.playerWithMostHorses(),
                        effect: ability.effects.modifyHandRankMod(1)
                    }));
                };
                const modifyHandRankEventHandler = () => {
                    if(this.playerWithMostHorses()) {
                        if(context.player.modifyRank(1, context)) {
                            this.game.addMessage('{0}\'s hand rank is increased by 1 thanks to {1} since their posse has the most horses; Current hand rank is {2}', 
                                context.player, this, context.player.getTotalRank());
                        }
                    }
                };
                this.game.onceConditional('onPlayWindowOpened', { condition: event => event.playWindow.name === 'shootout resolution' }, eventHandler);
                this.game.onceConditional('onPlayWindowClosed', { condition: event => event.playWindow.name === 'shootout resolution' }, modifyHandRankEventHandler);                
                this.game.once('onShootoutPhaseFinished', () => {
                    this.game.removeListener('onPlayWindowOpened', eventHandler);
                    this.game.removeListener('onPlayWindowOpened', modifyHandRankEventHandler);
                });
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to become a stud',
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
                    },
                    source: this
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
