const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ViveneGoldsun extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachment(att => att.getType() === 'goods' && att.hasKeyword('mystical')),
            match: this,
            effect: ability.effects.setAsStud()
        });
        
        this.action({
            title: 'Shootout: Vivene Goldsun',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromPlay((card, context) => card.parent === this &&
                    card.getType() === 'goods' &&
                    card.hasKeyword('mystical') &&
                    this.isUsefulMystical(card, context))
            ],
            target: {
                activePromptTitle: 'Choose dude to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: (card, context) => {
                        const maxValue = this.attachments.reduce((maxValue, att) => {
                            if(att.getType() !== 'goods' || !att.hasKeyword('mystical')) {
                                return maxValue;
                            }
                            return att.value > maxValue ? att.value : maxValue;
                        }, 0);
                        return card.getGrit(context) < maxValue;
                    } 
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to send {3} home booted', 
                    context.player, this, context.costs.discardFromPlay, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
            }
        });
    }

    isUsefulMystical(card, context) {
        if(!this.game.shootout) {
            return false;
        }
        if(context.target) {
            return card.value > context.target.getGrit(context);
        }
        const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!oppPosse) {
            return false;
        }
        const minGrit = oppPosse.getDudes().reduce((min, dude) =>
            dude.getGrit(context) < min ? dude.getGrit(context) : min, 999);
        return card.value > minGrit;
    }
}

ViveneGoldsun.code = '22012';

module.exports = ViveneGoldsun;
