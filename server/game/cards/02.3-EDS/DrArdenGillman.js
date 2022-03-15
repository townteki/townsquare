const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class DrArdenGillman extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Dr. Arden Gillman',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true 
                },
                cardType: ['dude']
            },
            handler: context => {
                context.player.pullForSkill(context.target.getGrit(), 'mad scientist', {
                    successHandler: context => {
                        let targetAced = false;
                        if(context.totalPullValue - 6 >= context.target.getGrit()) {
                            targetAced = true;
                            this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context)
                                .thenExecute(() => this.game.addMessage('{0} uses {1} to ace {2}', context.player, this, context.target));
                        } else {
                            this.game.shootout.sendHome(context.target, context)
                                .thenExecute(() => this.game.addMessage('{0} uses {1} to send {2} home', context.player, this, context.target));
                        }
                        if(context.pull.pulledCard.getType() === 'joker' || context.pull.pulledSuit === 'Spades') {
                            if(targetAced) {
                                this.game.resolveGameAction(GameActions.aceCard({ card: this }), context)
                                    .thenExecute(() => this.game.addMessage('{0} uses {1} to ace himself because the pull was a Joker or Spades', 
                                        context.player, this));
                            } else {
                                this.game.shootout.sendHome(this, context)
                                    .thenExecute(() => this.game.addMessage('{0} uses {1} to send him home because the pull was a Joker or Spades', 
                                        context.player, this));
                            }
                        }
                    },
                    pullingDude: this,
                    source: this
                }, context);
            }
        });
    }
}

DrArdenGillman.code = '04005';

module.exports = DrArdenGillman;
