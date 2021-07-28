const DudeCard = require('../../dudecard.js');

class SgtElijahClay extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardAbilityResolved: event => this.isParticipating() && 
                    event.ability.playTypePlayed() === 'shootout' &&
                    this.oppPosseCondition(),
                onPassAction: event => this.isParticipating() &&
                    event.playWindow.name === 'shootout plays' &&
                    this.oppPosseCondition()
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPhaseFinished: () => true
                    },
                    condition: () => this.isParticipating(),
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
                if(this.bullets < 3) {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutPhaseFinished: () => true
                        },
                        condition: () => this.isParticipating(),
                        match: this,
                        effect: ability.effects.setBullets(3)
                    }));                    
                }
            }
        });
    }

    oppPosseCondition() {
        const opp = this.controller.getOpponent();
        const playerPosseDudes = this.game.shootout.getPosseByPlayer(opp).getDudes();
        const oppPosseBullets = playerPosseDudes.reduce((memo, dude) => memo + dude.bullets, 0);
        const oppPosseBounty = playerPosseDudes.reduce((memo, dude) => memo + dude.bounty, 0);
        return oppPosseBounty > oppPosseBullets;
    }
}

SgtElijahClay.code = '21025';

module.exports = SgtElijahClay;
