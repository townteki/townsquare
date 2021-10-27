const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GuidingThePack extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout: Guiding the Pack',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                const thisPosse = this.game.shootout.getPosseByPlayer(context.player);
                const oppPosse = this.game.shootout.getPosseByPlayer(context.player.getOpponent());
                if(thisPosse && oppPosse && thisPosse.getDudes().length > oppPosse.getDudes().length) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose a card to boot',
                        cardCondition: card => card.isParticipating() &&
                            card.controller !== context.player,
                        gameAction: 'boot',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to boot {2}', player, this, card);
                            });
                            return true;
                        },
                        source: this
                    });
                }
                if(context.totalPullValue - 4 >= context.difficulty) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose your dude',
                        cardCondition: card => card.isParticipating() &&
                            card.controller === context.player,
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: card,
                                effect: ability.effects.modifyBullets(1)
                            }));
                            this.game.addMessage('{0} uses {1} to give {2} +1 bullets', player, this, card);
                            return true;
                        },
                        source: this
                    });
                }
            },
            source: this
        });
    }
}

GuidingThePack.code = '23045';

module.exports = GuidingThePack;
