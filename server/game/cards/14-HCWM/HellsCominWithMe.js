const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');

class HellsCominWithMe extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Hell\'s Comin\' With Me!',
            playType: ['shootout:join'],
            target: {
                activePromptTitle: 'Choose your dude to join',
                cardCondition: { location: 'play area', controller: 'current', participating: false },
                cardType: ['dude'],
                gameAction: 'joinPosse'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target })).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, context.target); 
                    if(context.target.hasAttachmentWithKeywords(['sidekick'])) {
                        this.game.makePlayOutOfOrder(context.player, this, `Make shootout play with a card attached to ${context.target.title}`);
                    }
                });                
            }
        });
    }   
}

HellsCominWithMe.code = '22054';

module.exports = HellsCominWithMe;
