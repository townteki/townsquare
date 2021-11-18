const GoodsCard = require('../../goodscard.js');
const JobAction = require('../../jobaction.js');

class DeAnnulosMysteriis extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: De Annulos Mysteriis',
            playType: ['noon'],
            cost: ability.costs.aceSelf(),
            target: {
                activePromptTitle: 'Select Job card marking location',
                cardCondition: { 
                    location: 'discard pile', 
                    controller: 'current', 
                    condition: card => this.isJobActionCard(card) 
                },
                cardType: ['action']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and aces it to play {2} from discard', 
                    context.player, this, context.target),
            handler: context => {
                if(context.player.moveCardWithContext(context.target, 'hand', context, true)) {
                    const eventHandler = event => {
                        this.untilEndOfShootoutPhase(context.ability, ability => ({
                            match: event.shootout.leader,
                            effect: [
                                ability.effects.setAsStud(),
                                ability.effects.modifyBullets(1)
                            ]
                        }));
                        this.game.addMessage('{0} makes {1} a stud and gives them +1 bullets thanks to {2}', 
                            context.player, event.shootout.leader, this);
                    };
                    this.game.once('onShootoutPhaseStarted', eventHandler);                    
                    context.target.useAbility(context.player, { 
                        doNotMarkActionAsTaken: true
                    });
                    this.game.onceConditional('onCardAbilityResolved', { condition: event => event.ability === context.ability },
                        () => this.game.removeListener('onShootoutPhaseStarted', eventHandler));
                }
            }
        });
    }

    isJobActionCard(card) {
        if(card.getType() !== 'action') {
            return false;
        }
        return card.abilities.actions.some(action => action instanceof JobAction);
    }
}

DeAnnulosMysteriis.code = '18030';

module.exports = DeAnnulosMysteriis;
