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
                const oppPosse = this.game.shootout.getPosseByPlayer(context.player.getOpponent());
                if(!oppPosse) {
                    return;
                }
                const totalDudesAndSK = oppPosse.getDudes().reduce((total, dude) => 
                    total + dude.getAttachmentsByKeywords(['sidekick']).length + 1, 0);
                context.player.getOpponent().modifyRank(totalDudesAndSK > 4 ? -4 : -totalDudesAndSK);
            },
            source: this
        });
    }
}

MissedMe.code = '23041';

module.exports = MissedMe;
