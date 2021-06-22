const SpellCard = require('../../spellcard.js');

class MischievousCoyote extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Mischievous Coyote',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            condition: () => this.hasOneDrawAndStud(),
            difficulty: 9,
            onSuccess: (context) => {
                this.lastingEffect(ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: context.player,
                    effect: ability.effects.switchBulletBonuses()
                }));
            },
            source: this
        });
    }

    hasOneDrawAndStud() {
        if(!this.game.shootout) {
            return false;
        }
        const posse = this.game.shootout.getPosseByPlayer(this.controller);
        const drawDudes = posse.getDudes(dude => dude.isDraw() && !dude.isToken());
        const studDudes = posse.getDudes(dude => dude.isStud() && !dude.isToken());
        return drawDudes.length > 0 && studDudes.length > 0;
    }
}

MischievousCoyote.code = '20048';

module.exports = MischievousCoyote;
