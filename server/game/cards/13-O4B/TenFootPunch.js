const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TenFootPunch extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Shootout: Ten-Foot Punch',
            playType: ['shootout:join'],
            actionContext: { gameAction: 'joinPosse' },
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.kfDude }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.kfDude,
                        effect: ability.effects.modifySkillRating('kung fu', 1)
                    }));
                    this.game.addMessage('{0} uses {1} to give {2} +1 Kung Fu rating and join them to posse', 
                        context.player, this, context.kfDude);
                });
                const oppPosse = this.game.shootout.getPosseByPlayer(context.player.getOpponent());
                if(oppPosse && oppPosse.findInPosse(dude => dude.bullets <= context.kfDude.getKungFuRating())) {
                    this.game.resolveGameAction(GameActions.revealTopCards({
                        player: context.player,
                        amount: 5,
                        properties: {
                            activePromptTitle: 'Select card to put to hand',
                            selectCondition: card => card instanceof TechniqueCard &&
                                !card.isTaoTechnique(),
                            onSelect: (player, cards) => {
                                player.moveCardWithContext(cards[0], 'hand', context);
                            }
                        }
                    }), context).thenExecute(event => {
                        let cardsToDiscard = event.topCards;
                        if(event.selectedCards) {
                            this.game.addMessage('{0} chooses {1} from cards revealed by {2} ' +
                                'to put into their hand and discards rest', context.player, event.selectedCards, this);
                            cardsToDiscard = cardsToDiscard.filter(card => !event.selectedCards.includes(card));
                        } else {
                            this.game.addMessage('{0} discards cards revealed by {1}', context.player, this);
                        }
                        context.player.discardCards(cardsToDiscard, () => true, {}, context);
                    });
                }
            }
        });
    }
}

TenFootPunch.code = '21052';

module.exports = TenFootPunch;
