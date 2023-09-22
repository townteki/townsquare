const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class FelixCutler extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Unboot Hex or Goods',
            playType: ['resolution'],
            target: {
                activePromptTitle: 'Select Hex or Goods',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current',
                    participating: true,
                    condition: card => card.getType() === 'goods' ||
                        card.isHex()
                },
                cardType: ['spell', 'goods']
            },
            ifCondition: context => context.player.isCheatin(),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but fails because their hand is legal', context.player, this),            
            message: context => this.game.addMessage('{0} uses {1} to unboot {2} and reset its abilities', 
                context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                context.target.resetAbilities();
            }
        });
    }
}

FelixCutler.code = '25022';

module.exports = FelixCutler;
