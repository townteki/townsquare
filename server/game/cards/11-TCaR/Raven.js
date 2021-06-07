const LegendCard = require('../../legendcard.js');

class Raven extends LegendCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.game.shootout.leaderPlayer === this.controller &&
                this.getPosseBullets(this.controller) < this.getPosseBullets(this.controller.getOpponent()),
            match: this.owner,
            effect: [
                ability.effects.modifyPosseStudBonus(-2)
            ]
        });

        this.persistentEffect({
            condition: () => this.game.currentPhase === 'sundown' &&
                this.ravenHasEnoughOccupiedDeeds(),
            match: this.owner,
            effect: ability.effects.modifyPlayerControl(1)
        });

        this.action({
            title: 'Raven',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an in-town deed',
                cardCondition: { location: 'play area', controller: 'any', condition: card => !card.isOutOfTown() },
                cardType: ['deed']
            },
            handler: context => {
                this.untilEndOfRound(ability => ({
                    condition: () => this.game.shootout &&
                        this.game.shootout.shootoutLocation.locationCard === context.target,
                    match: context.player,
                    effect: ability.effects.modifyPosseShooterBonus(2)
                }));
                this.game.addMessage('{0} uses {1} to give their shooter +2 bullets during shootouts in {2}', 
                    context.player, this, context.target);
                const eventHandler = () => {
                    const dudesAtRaven = this.game.getDudesAtLocation(context.target.uuid);
                    const givePermBullets = card => {
                        if(card.permanentBullets <= 0) {
                            this.game.addMessage('{0} gives +1 permanent bullets to {1} thanks to {2}', 
                                context.player, card, this);                           
                            card.modifyBullets(1);
                        }
                    };
                    if(dudesAtRaven.length === 1) {
                        givePermBullets(dudesAtRaven[0]);
                    } else {
                        this.game.promptForSelect(context.player, {
                            activePromptTitle: 'Select a dude to get permanent bullet',
                            waitingPromptTitle: 'Waiting for opponent to select dude',
                            cardCondition: card => dudesAtRaven.includes(card),
                            cardType: 'dude',
                            onSelect: (player, card) => {
                                givePermBullets(card);
                                return true;
                            },
                            source: this
                        });
                    }
                };
                this.game.onceConditional('onShootoutPhaseFinished', { 
                    condition: event => event.shootout.shootoutLocation.locationCard === context.target &&
                        event.shootout.winner === context.player
                }, eventHandler);
                this.game.once('onRoundEnded', () => {
                    this.game.removeListener('onShootoutPhaseFinished', eventHandler);
                });
                this.game.once('onSundownAfterVictoryCheck', () => {
                    if(context.target.controller === context.player && context.target.owner !== context.player) {
                        eventHandler();
                    }
                });
            }
        });
    }

    getPosseBullets(player) {
        let playerPosseDudes = this.game.shootout.getPosseByPlayer(player).getDudes();
        return playerPosseDudes.reduce((memo, dude) => memo + dude.bullets, 0);
    }

    ravenHasEnoughOccupiedDeeds() {
        const opponent = this.controller.getOpponent();
        const allLocations = this.controller.locations.concat(opponent.locations || []);
        const inTownDeeds = allLocations.map(loc => loc.locationCard).filter(card => card.getType() === 'deed' && !card.isOutOfTown());
        const occupation = {};
        inTownDeeds.forEach(deed => {
            if(deed.controller !== deed.owner) {
                if(occupation[deed.controller.name]) {
                    occupation[deed.controller.name] += 1;
                } else {
                    occupation[deed.controller.name] = 1;
                }
            }
        });
        return (occupation[this.controller.name] || 0) >= (occupation[opponent.name] || 0);
    }
}

Raven.code = '19004';

module.exports = Raven;
