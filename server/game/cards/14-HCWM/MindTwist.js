const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MindTwist extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon/Shootout: Boot a spell',
            playType: ['noon', 'shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a spell to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: (card, context) => card !== this &&
                        card.parent && card.parent.getType() === 'dude' &&
                        (!this.game.shootout || (this.parent.isParticipating() && this.parent.controller !== context.player)) &&
                        card.gamelocation === this.gamelocation
                },
                cardType: ['spell'],
                gameAction: 'boot'
            },
            difficulty: 6,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);
                });
            },
            source: this
        });

        this.spellAction({
            title: 'Noon: Set influence to 1',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude']
            },
            difficulty: 6,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setInfluence(1),
                        ability.effects.cannotIncreaseInfluence('any', context => context.source !== this),
                        ability.effects.cannotDecreaseInfluence('any', context => context.source !== this)
                    ]
                }));      
                this.game.addMessage('{0} uses {1} to set {2}\'s influence to 1 until after Sundown', context.player, this, context.target); 
            },
            source: this
        });
    }
}

MindTwist.code = '22046';

module.exports = MindTwist;
