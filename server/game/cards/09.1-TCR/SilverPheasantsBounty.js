const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SilverPheasantsBounty extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.attachmentRestriction({ type: 'deed'});

        this.whileAttached({
            effect: ability.effects.modifyProduction(1)
        });

        this.spellAction({
            title: 'Noon: Silver Pheasant\'s Bounty',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            difficulty: 6,
            onSuccess: (context) => {
                context.player.modifyGhostRock(2);
                this.game.addMessage('{0} uses {1} to gain 2 GR', context.player, this);
            },
            source: this
        });
    }
}

SilverPheasantsBounty.code = '15016';

module.exports = SilverPheasantsBounty;
