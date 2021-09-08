const GoodsCard = require('../../goodscard.js');

class AethericShockwaveInducer extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onShooterPicked: event => event.card === this.parent
            },
            handler: context => {
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(pulledSuit === 'Clubs') {
                        this.untilEndOfShootoutRound(context.ability, ability => ({
                            match: this,
                            effect: ability.effects.modifyBullets(-3)
                        }));
                        this.game.addMessage('{0} gives -3 bullets penalty to {1} because it fails', context.player, this);
                    }
                }, true, { context });
            }
        });
    }
}

AethericShockwaveInducer.code = '17014';

module.exports = AethericShockwaveInducer;
