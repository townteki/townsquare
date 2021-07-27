const ActionCard = require('../../actioncard.js');

class YouHadOneJob extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Make Stud',
            target: {
                cardCondition: {
                    location: 'play area',
                    condition: card => card.isWanted() && card.bounty >= 3
                },
                cardType: 'dude'
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, context.target);
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
            },
            source: this
        });

        this.action({
            title: 'Shootout: Make Draw',
            target: {
                cardCondition: {
                    location: 'play area',
                    condition: card => card.isWanted() && card.bounty >= 3
                },
                cardType: 'dude'
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to make {2} a draw', context.player, this, context.target);
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsDraw()
                }));
            },
            source: this
        });

        this.action({
            title: 'Resolution: Reduce Casualties',
            playType: 'resolution',
            handler: context => {
                if(!context.player.isCheatin()) {
                    this.game.promptForYesNo(context.player, {
                        title: 'Reduce your casualties by 2?',
                        onYes: player => {
                            player.modifyCasualties(-2);
                            this.game.addMessage('{0} uses {1} to reduce their casualties by 2', player, this);
                        }
                    });
                }

                if(!context.player.getOpponent().isCheatin()) {
                    this.game.promptForYesNo(context.player.getOpponent(), {
                        title: 'Reduce your casualties by 2?',
                        onYes: player => {
                            player.modifyCasualties(-2);
                            this.game.addMessage('{0} uses {1} to reduce their casualties by 2', player, this);
                        }
                    });
                }
            },
            source: this
        });
    }
}

YouHadOneJob.code = '19042';

module.exports = YouHadOneJob;
