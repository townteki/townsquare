const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AncestorsReproach extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout: Ace card to summon Ancestor Spirit',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.ace(card => card.location === 'hand' && card.controller === this.controller)
            ],
            difficulty: 8,
            onSuccess: (context) => {
                this.summonAncestorSpirit(context);           
            },
            source: this
        });

        this.spellAction({
            title: 'Cheatin\' Resolution: Summon Ancestor Spirit',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.summonAncestorSpirit(context);
            },
            source: this
        });
    }

    summonAncestorSpirit(context) {
        let ancestorspirit = context.player.placeToken('09041', this.parent.gamelocation);
        this.game.resolveGameAction(GameActions.joinPosse({ card: ancestorspirit }), context).thenExecute(() => {
            this.game.addMessage('{0} uses {1} and aces {2} to bring a {3} into their posse', 
                context.player, this, context.costs.ace, ancestorspirit);  
        });     
    }
}

AncestorsReproach.code = '22049';

module.exports = AncestorsReproach;
