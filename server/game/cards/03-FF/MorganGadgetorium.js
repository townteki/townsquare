const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class MorganGadgetorium extends OutfitCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Morgan Gadgetorium',
            triggerBefore: true,
            when: {
                onPullForSkill: event => event.player === this.owner
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to raise difficulty of skill check by 2 to {2}', 
                    context.player, this, context.event.difficulty + 2),
            handler: context => {
                const eventHandler = event => {
                    context.player.modifyGhostRock(1);
                    let unbootText = '';
                    if(context.event.properties.bootedToInvent) {
                        this.game.resolveGameAction(GameActions.unbootCard({ 
                            card: event.pullingDude
                        }), context);
                        unbootText = ' and unboots {2}';
                    }
                    this.game.addMessage('{0} gains 1 GR thanks to {1}' + unbootText, context.player, this, event.pullingDude);
                };
                const saveEventHandler = context.event.handler;
                context.replaceHandler(pullSkillEvent => {
                    this.game.onceConditional('onPullSuccess', { 
                        condition: event => event.source === pullSkillEvent.properties.source &&
                            event.pullingDude === pullSkillEvent.properties.pullingDude
                    }, eventHandler);
                    pullSkillEvent.difficulty += 2;
                    saveEventHandler(pullSkillEvent);
                    this.game.queueSimpleStep(() => { 
                        this.game.removeListener('onPullSuccess', eventHandler);
                    });     
                });
            }
        });
    }
}

MorganGadgetorium.code = '05003';

module.exports = MorganGadgetorium;
