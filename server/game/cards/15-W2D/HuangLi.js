const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HuangLi extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Huang Li',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.controller === this.controller &&
                card.getType() === 'dude' &&
                card.isParticipating()),
            handler: context => {
                context.player.redrawFromHand(1, (event, discarded) => 
                    this.game.addMessage('{0} uses {1} to discard {2} and draw a card', context.player, this, discarded),
                { source: this }, context);
                if(context.costs.boot.hasKeyword('blessed')) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose a dude to unboot',
                        cardCondition: { 
                            location: 'play area', 
                            controller: 'current', 
                            participating: true,
                            booted: true
                        },
                        cardType: 'dude',
                        gameAction: 'unboot',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.unbootCard({ card }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to unboot {2}', player, this, card);
                            });
                            return true;
                        },
                        source: this,
                        context
                    });
                }
                if(context.costs.boot.hasKeyword('abomination')) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.modifyBullets(2)
                    }));
                    this.game.addMessage('{0} uses {1} to give him +2 bullets', context.player, this);
                }                
                if(context.costs.boot.hasKeyword('kung fu')) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose a dude to boot',
                        cardCondition: { 
                            location: 'play area', 
                            controller: 'opponent', 
                            participating: true,
                            booted: false
                        },
                        cardType: 'dude',
                        gameAction: 'boot',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to boot {2}', player, this, card);
                            });
                            return true;
                        },
                        source: this,
                        context
                    });
                }                
            }
        });
    }
}

HuangLi.code = '23004';

module.exports = HuangLi;
