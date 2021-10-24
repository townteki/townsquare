const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LeychaaiYoungheart extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon/Shootout: Leychaa\'i Youngheart',
            playType: ['noon', 'shootout'],
            targets: {
                sidekick: {
                    activePromptTitle: 'Choose Sidekick to move',
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'current', 
                        condition: card => card.hasKeyword('sidekick') &&
                            !card.hasKeyword('spirit') &&
                            card.isNearby(this.gamelocation)
                    }
                },
                targetDude: {
                    activePromptTitle: 'Choose Dude to receive Sidekick',
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'current', 
                        condition: card => card.isNearby(this.gamelocation) 
                    },
                    cardType: ['dude']
                }
            },
            handler: context => {
                const originalParent = context.targets.sidekick.parent;
                context.player.attach(context.targets.sidekick, context.targets.targetDude, 'ability', () => 
                    this.game.addMessage('{0} uses {1} to move {2} from {3} to {4}', 
                        context.player, this, context.targets.sidekick, originalParent, context.targets.targetDude)
                );
            }
        });
    }
}

LeychaaiYoungheart.code = '21014';

module.exports = LeychaaiYoungheart;
