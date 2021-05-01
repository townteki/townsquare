const GameActions = require('../../GameActions/index.js');
const NullEvent = require('../../NullEvent.js');
const SpellCard = require('../../spellcard.js');

class PhantomFingers extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Phantom Fingers',
            playType: ['noon', 'shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a goods card',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.gamelocation === this.gamelocation || 
                        card.parent.isAdjacent(this.gamelocation) &&
                        (!this.game.shootout || card.parent.isParticipating())
                },
                cardType: ['goods']
            },
            difficulty: 6,
            onSuccess: (context) => {
                const event = this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.blankExcludingKeywords
                }));
                const msgText = (event instanceof NullEvent) ? 'target' : 'boot';
                this.game.addMessage('{0} uses {1} to {2} {3}, and it loses all traits, abilities, and bullet bonuses',
                    context.player, this, msgText, context.target);
                if(context.target.hasOneOfKeywords(['mystical', 'gadget'])) {
                    context.player.drawCardsToHand(1, context);
                    this.game.addMessage('{0} draws a card thanks to {1}', context.player, this);
                }
            },
            source: this
        });
    }
}

PhantomFingers.code = '10030';

module.exports = PhantomFingers;
