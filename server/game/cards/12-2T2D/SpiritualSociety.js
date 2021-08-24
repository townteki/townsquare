const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class SpiritualSociety extends OutfitCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onCardsDrawn: event => event.player === this.owner && event.reason === 'sundown' &&
                    this.isControllingTownSquare()
            },
            handler: context => {
                context.player.drawCardsToHand(1, context);
                this.game.addMessage('{0} draws a card thanks to {1}', context.player, this);
            }
        });

        this.action({
            title: 'Noon: Spiritual Society',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.location === 'play area' &&
                    card.getType() === 'dude' &&
                    card.controller === this.owner
                )                
            ],
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude to boot',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller !== this.controller &&
                        card.influence < context.costs.boot.influence &&
                        card.isInSameLocation(context.costs.boot),
                    cardType: 'dude',
                    gameAction: 'boot',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.bootCard({ card }, context)).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} and boots {2} to boot {3}', player, this, context.costs.boot, card);
                        });                     
                        return true;
                    },
                    source: this
                });                
            }
        });
    }

    isControllingTownSquare() {
        let myInfluence = 0;
        let oppInfluence = 0;
        this.game.townsquare.getDudes().forEach(dude => {
            if(dude.controller === this.owner) {
                myInfluence += dude.influence;
            } else {
                oppInfluence += dude.influence;
            }
        });
        return myInfluence >= oppInfluence;
    }
}

SpiritualSociety.code = '20003';

module.exports = SpiritualSociety;
