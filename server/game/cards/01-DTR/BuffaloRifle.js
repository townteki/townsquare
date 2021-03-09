const GoodsCard = require('../../goodscard.js');

class BuffaloRifle extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => 
                    event.card === this.parent &&
                    this.game.shootout.shootoutLocation.isAdjacent(this.gamelocation)
            },
            handler: context => {
                context.game.promptForYesNo(context.player, {
                    title: 'Do you want to use ' + this.title + ' and snipe from distance?',
                    onYes: () => {
                        context.game.shootout.addMoveOptions(this.parent, { moveToPosse: false });
                    }
                });
            }
        });
    }
}

BuffaloRifle.code = '01097';

module.exports = BuffaloRifle;
