const DudeCard = require('../../dudecard.js');

class LukeTheErrandBoy extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Noon/Shootout: Luke, the Errand Boy',
            playType: ['noon', 'shootout'],
            targets: {
                tGadget: {
                    activePromptTitle: 'Choose Gadget to move',
                    cardCondition: {
                        location: 'play area',
                        controller: 'current',
                        condition: card => card.isGadget() && card.parent &&
                            card.parent.getType() === 'dude' &&
                            card.isNearby(this.gamelocation)
                    }
                },
                tDude: {
                    activePromptTitle: 'Choose Dude to receive Gadget',
                    cardCondition: {
                        location: 'play area',
                        controller: 'current',
                        condition: card => card.isNearby(this.gamelocation)
                    },
                    cardType: ['dude']
                }
            },
            handler: context => {
                const originalParent = context.targets.tGadget.parent;
                context.player.attach(context.targets.tGadget, context.targets.tDude, 'ability', () =>
                    this.game.addMessage('{0} uses {1} to move {2} from {3} to {4}',
                        context.player, this, context.targets.tGadget, originalParent, context.targets.tDude)
                );
            }
        });
    }
}

LukeTheErrandBoy.code = '13007';

module.exports = LukeTheErrandBoy;
