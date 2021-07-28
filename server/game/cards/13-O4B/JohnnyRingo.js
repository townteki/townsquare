const DudeCard = require('../../dudecard.js');

class JohnnyRingo extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.johnnyRingoCondition(),
            match: this.game.getPlayers(),
            effect: ability.effects.onlyShooterContributes()
        });

        this.action({
            title: 'Johnny Ringo',
            playType: ['shootout'],
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent dudes to be chosen or affected by their opponent\'s abilities', 
                    context.player, this),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    condition: () => true,
                    match: card => card.getType() === 'dude' && card.isParticipating(),
                    effect: [
                        ability.effects.cannotBeAffected('opponent', () => true, 'any', 'react'),
                        ability.effects.cannotBeAffected('opponent', () => true, 'any', 'resolution'),
                        ability.effects.cannotBeAffectedByShootout('opponent')
                    ]
                }));
            }
        });
    }

    johnnyRingoCondition() {
        if(!this.game.shootout) {
            return false;
        }
        const johnnyPosse = this.game.shootout.getPosseByPlayer(this.controller);
        if(!johnnyPosse) {
            return false;
        }
        return this.isWanted() && this.isParticipating() && johnnyPosse.getDudes().length === 1;
    }
}

JohnnyRingo.code = '21032';

module.exports = JohnnyRingo;
