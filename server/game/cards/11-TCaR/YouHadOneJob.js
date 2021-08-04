const ActionCard = require('../../actioncard.js');

class YouHadOneJob extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Change Bullet Type',
            target: {
                cardCondition: {
                    location: 'play area',
                    condition: card => card.isWanted() && card.bounty >= 3 && card.isParticipating()
                },
                cardType: 'dude'
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Change to stud or draw?',
                        buttons: [
                            {
                                text: 'Change to Stud',
                                method: 'stud'
                            },
                            {
                                text: 'Change to Draw',
                                method: 'draw'
                            }
                        ]
                    },
                    source: this
                });
            }
        });

        this.action({
            title: 'Resolution: Reduce Casualties',
            playType: 'resolution',
            handler: context => {
                this.game.getPlayers().forEach(p => {
                    if(!p.isCheatin()) {
                        this.game.promptForYesNo(p, {
                            title: 'Reduce your casualties by 2?',
                            onYes: player => {
                                player.modifyCasualties(-2);
                                this.game.addMessage('{0} uses {1} to reduce their casualties by 2', player, this);
                            }
                        });
                    }
                });
            },
            source: this
        });
    }

    stud(player) {
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: ability.effects.setAsStud()
        }));
        this.game.addMessage('{0} uses {1} to make {2} a stud', player, this, this.abilityContext.target);
        return true;
    }

    draw(player) {
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this.abilityContext.target,
            effect: ability.effects.setAsDraw()
        }));
        this.game.addMessage('{0} uses {1} to make {2} a draw', player, this, this.abilityContext.target);
        return true;
    }
}

YouHadOneJob.code = '19042';

module.exports = YouHadOneJob;
