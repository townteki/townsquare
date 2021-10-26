const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TomasRamirez extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Tomas Ramirez',
            playType: ['shootout'],
            cost: ability.costs.boot(card => card.parent &&
                    card.parent === this &&
                    card.hasKeyword('hex'), 'discard'),
            target: {
                activePromptTitle: 'Choose a weapon to discard',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    participating: true,
                    condition: card => card.hasKeyword('weapon')
                },
                gameAction: 'discard'
            },
            handler: context => {
                const skillRating = this.getSkillRating('huckster');
                context.player.pullForSkill(context.target.value, skillRating, {
                    successHandler: context => {
                        this.game.resolveGameAction(GameActions.discardCard({ card: context.target }, context));
                        this.game.resolveGameAction(GameActions.discardCard({ card: context.costs.boot }, context));
                        this.game.addMessage('{0} uses {1} and discards {2} to discard {3}', 
                            context.player, this, context.costs.boot, context.target);
                    },
                    pullingDude: this,
                    source: this
                }, context);
            }
        });
    }
}

TomasRamirez.code = '22025';

module.exports = TomasRamirez;
