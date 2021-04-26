const GoodsCard = require('../../goodscard.js');

class BuffaloRifle extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoiningPosse: event => 
                    event.card === this.parent &&
                    this.game.shootout.shootoutLocation.isAdjacent(this.gamelocation)
            },
            handler: context => {
                context.game.promptForYesNo(context.player, {
                    title: 'Do you want to use ' + this.title + ' and snipe from distance?',
                    onYes: () => {
                        this.lastingEffect(ability => ({
                            until: {
                                onShootoutPossesGathered: () => true,
                                onShootoutPhaseFinished: () => true
                            },
                            match: this.parent,
                            effect: [
                                ability.effects.canJoinWithoutMoving(),
                                ability.effects.canJoinWithoutBooting()
                            ]
                        }));
                        this.game.addMessage('{0} uses {1} to join {2} to posse from adjacent location', context.player, this, this.parent);
                    }
                });
            }
        });
    }
}

BuffaloRifle.code = '01097';

module.exports = BuffaloRifle;
