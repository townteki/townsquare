const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MissedMe extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Cheatin\' Resolution: Missed Me!',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                const opponent = context.player.getOpponent();
                const oppPosse = this.game.shootout.getPosseByPlayer(opponent);
                if(!oppPosse) {
                    return;
                }
                const totalDudesAndSK = oppPosse.getDudes().reduce((total, dude) => 
                    total + dude.getAttachmentsByKeywords(['sidekick']).length + 1, 0);
                const rankMod = totalDudesAndSK > 4 ? -4 : -totalDudesAndSK;
                opponent.modifyRank(rankMod);
                this.game.addMessage('{0} uses {1} to decrease {2}\'s rank by {3}; Current rank is {4}', 
                    context.player, this, opponent, rankMod, opponent.getTotalRank());
            },
            source: this
        });
    }
}

MissedMe.code = '23041';

module.exports = MissedMe;
