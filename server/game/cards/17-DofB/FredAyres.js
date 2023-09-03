const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FredAyres extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachment(attachment => attachment.getType() === 'goods' && attachment.hasKeyword('Mystical')),
            match: this,
            effect: [
                ability.effects.modifyInfluence(1),
                ability.effects.modifyBullets(1)
            ]
        });        

        this.action({
            title: 'Look at top card',
            playType: ['noon'],
            cost: ability.costs.boot(card => 
                this.equals(card.parent) && 
                card.getType() === 'goods' && 
                card.hasKeyword('mystical')),
            message: context => 
                this.game.addMessage('{0} uses {1} to look at the top card of their deck', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.lookAtDeck({ 
                    player: context.player,
                    lookingAt: context.player,
                    context,
                    amount: 1,
                    source: this
                }));
            }
        });
    }
}

FredAyres.code = '25010';

module.exports = FredAyres;
