const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class TheArsenal extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: The Arsenal',
            playType: ['noon'],
            repeatable: true,
            cost: ability.costs.boot(card =>
                card.controller === this.owner &&
                (card.isGadget() || card.isSpell()) &&
                card.isParticipating()
            ),
            message: context => 
                this.game.addMessage('{0} uses {1} to call out {2}', context.player, this, context.target),
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select dude to Call Out',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && 
                        card.controller !== context.player &&
                        card.getType() === 'dude' &&
                        card.gamelocation === context.costs.boot.gamelocation &&
                        (card.isWanted() || !card.booted),
                    cardType: 'dude',
                    gameAction: 'callout',
                    onSelect: (player, callee) => {
                        this.game.resolveGameAction(GameActions.callOut({ caller: context.costs.boot.parent, callee }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to have {2} call out {3}', 
                                player, this, context.costs.boot.parent, callee);  
                        });
                        return true;
                    },
                    source: this
                });                
            }
        });
    }
}

TheArsenal.code = '05002';

module.exports = TheArsenal;
