const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class LorenaCorbett extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Lorena Corbett',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and chooses {2} who is considered to have a minimum grit of 11', 
                    context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setGritFunc((grit, context) => {
                            if(context.player === this.controller && context.ability && context.ability.isCardAbility()) {
                                return grit < 11 ? 11 : grit;
                            }
                            return grit;
                        })
                    ]
                }));
                const mysticalGoods = this.getAttachmentsByKeywords(['mystical']);
                if(mysticalGoods && mysticalGoods.length > 0) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select mystical goods',
                        waitingPromptTitle: 'Waiting for opponent to select mystical goods',
                        cardCondition: card => mysticalGoods.includes(card),
                        cardType: 'goods',
                        gameAction: 'boot',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} and boots {2} to boot {3}', context.player, this, card, context.target);
                                });
                            });
                            return true;
                        },
                        source: this
                    });
                }
            }
        });
    }
}

LorenaCorbett.code = '21020';

module.exports = LorenaCorbett;
