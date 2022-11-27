const PhaseNames = require('../../Constants/PhaseNames.js');
const LegendCard = require('../../legendcard.js');

class Raven extends LegendCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.controller.equals(this.game.shootout.leaderPlayer) &&
                this.game.shootout.getPosseStat(this.controller, 'bullets') < this.game.shootout.getPosseStat(this.controller.getOpponent(), 'bullets'),
            match: this.owner,
            effect: [
                ability.effects.modifyPosseStudBonus(-2)
            ]
        });

        this.persistentEffect({
            condition: () => this.game.currentPhase === PhaseNames.Sundown &&
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
                this.untilEndOfRound(context.ability, ability => ({
                    condition: () => this.game.shootout &&
                        context.target.equals(this.game.shootout.shootoutLocation.locationCard),
                    match: context.player,
                    effect: ability.effects.modifyPosseShooterBonus(2)
                }));
                this.game.addMessage('{0} uses {1} to give their shooter +2 bullets during shootouts in {2}', 
                    context.player, this, context.target);
                const eventHandler = () => {
                    const eligibleDudes = this.game.getDudesAtLocation(context.target.uuid).filter(dude => dude.permanentBullets <= 0);
                    const givePermBullets = card => {
                        if(card.permanentBullets <= 0 && !this.permanentBulletGiven) {
                            this.game.addMessage('{0} gives +1 permanent bullets to {1} thanks to {2}', 
                                context.player, card, this);                           
                            card.modifyBullets(1);
                            this.permanentBulletGiven = true;
                        }
                    };
                    if(eligibleDudes.length === 1) {
                        givePermBullets(eligibleDudes[0]);
                    } else if(eligibleDudes.length > 1) {
                        this.game.promptForSelect(context.player, {
                            activePromptTitle: 'Select a dude to get permanent bullet',
                            waitingPromptTitle: 'Waiting for opponent to select dude',
                            cardCondition: card => eligibleDudes.includes(card),
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
                    condition: event => context.target.equals(event.shootout.shootoutLocation.locationCard) &&
                        context.player.equals(event.shootout.winner) 
                }, eventHandler);
                this.game.once('onRoundEnded', () => {
                    this.permanentBulletGiven = false;
                });
                this.game.once('onSundownAfterVictoryCheck', () => {
                    if(context.target.controller.equals(context.player) && !context.target.owner.equals(context.player)) {
                        eventHandler();
                    }
                });
            }
        });
    }

    ravenHasEnoughOccupiedDeeds() {
        const opponent = this.controller.getOpponent();
        const allLocations = this.controller.locations.concat(opponent.locations || []);
        const inTownDeeds = allLocations.map(loc => loc.locationCard).filter(card => card.getType() === 'deed' && !card.isOutOfTown());
        const occupation = {};
        inTownDeeds.forEach(deed => {
            if(!deed.controller.equals(deed.owner)) {
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
