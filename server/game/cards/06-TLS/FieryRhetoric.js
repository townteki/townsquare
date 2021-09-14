const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FieryRhetoric extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellJobAction({
            title: 'Noon: Fiery Rhetoric',
            playType: ['noon'],
            difficulty: 6,
            jobProperties: {
                cost: ability.costs.bootParent(),
                target: 'townsquare',
                message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
                onSuccess: (job, context) => {
                    const numOfWantedDudes = this.game.getNumberOfCardsInPlay(card =>
                        card.controller !== context.player &&
                        card.getType() === 'dude' &&
                        card.isWanted());
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this.parent,
                        effect: ability.effects.modifyControl(numOfWantedDudes)
                    }));
                    if(numOfWantedDudes) {
                        this.game.addMessage('{0} uses {1} to give {2} +{3} CP until the end of the day', 
                            context.player, this, this.parent, numOfWantedDudes);
                    } else {
                        this.game.addMessage('{0} uses {1}, but there are no opposing wanted dudes', 
                            context.player, this);
                    }
                }
            },
            source: this
        });
    }
}

FieryRhetoric.code = '10028';

module.exports = FieryRhetoric;
