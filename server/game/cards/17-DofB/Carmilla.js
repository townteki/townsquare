const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class Carmilla extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Title',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select dude to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.isInSameLocation(this) 
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            handler: context => {
                context.player.pullForSkill(context.target.getGrit(), 'huckster', {
                    successHandler: context => {
                        this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => 
                            this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target));
                    },
                    failHandler: context => {
                        this.game.resolveGameAction(GameActions.bootCard({ card: this }), context).thenExecute(() => 
                            this.game.addMessage('{0} uses {1}, but has to boot herself due to failed pull', context.player, this));
                    },
                    pullingDude: this,
                    source: this
                }, context);                
            }
        });
    }
}

Carmilla.code = '25027';

module.exports = Carmilla;
