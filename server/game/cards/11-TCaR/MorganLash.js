const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class MorganLash extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.getFaction() === Factions.Outlaws, 
            effect: ability.effects.reduceSelfCost('any', () => this.getHighestBounty())
        });

        this.persistentEffect({
            condition: () => this.isShooterMostWanted(),
            match: player => player.equals(this.controller),
            effect: ability.effects.modifyPosseShooterBonus(2)
        });

        this.reaction({
            title: 'Morgan Lash',
            when: {
                onShooterPicked: event => event.card.controller === this.controller
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to raise {2}\'s bounty by 2', context.player, this, context.event.card),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.event.card, amount: 2 }), context);
            }
        });
    }

    getHighestBounty() {
        return this.controller.cardsInPlay.filter(card => card.getType() === 'dude').
            reduce((maxBounty, dude) => dude.bounty > maxBounty ? dude.bounty : maxBounty, 0);
    }

    isShooterMostWanted() {
        if(!this.game.shootout || !this.game.shootout.opposingPosse) {
            return false;
        }

        const myPosse = this.game.shootout.getPosseByPlayer(this.controller);
        const opponentPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        return myPosse.shooter && opponentPosse.shooter && myPosse.shooter.bounty > opponentPosse.shooter.bounty;
    }
}

MorganLash.code = '19016';

module.exports = MorganLash;

