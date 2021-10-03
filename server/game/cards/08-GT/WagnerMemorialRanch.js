const Factions = require('../../Constants/Factions.js');
const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class WagnerMemorialRanch extends DeedCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.startingCondition = () => this.owner.getFaction() === Factions.Entrepreneurs;
    }

    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Wagner Memorial Ranch',
            triggerBefore: true,
            when: {
                onPullForSkill: event => event.player === this.owner &&
                    event.properties.source && event.properties.source.hasKeyword('gadget') &&
                    event.properties.pullingDude.gamelocation === this.uuid
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to lower difficulty of skill check by 2 to {2}', 
                    context.player, this, context.event.difficulty - 2),
            handler: context => {
                const eventHandler = event => {
                    let unbootText = '';
                    if(event.pullingDude.booted) {
                        this.game.resolveGameAction(GameActions.unbootCard({ 
                            card: event.pullingDude
                        }), context);
                        unbootText = 'unboots {1}';
                    }
                    if(event.source.hasOneOfKeywords(['horse', 'improvement'])) {
                        this.modifyProduction(1);
                        unbootText += unbootText ? ' and ' : '';
                        unbootText += 'gives +1 production to {2}';
                    }
                    if(unbootText) {
                        this.game.addMessage('{0} ' + unbootText, context.player, event.pullingDude, this);
                    }
                };
                const saveEventHandler = context.event.handler;
                context.replaceHandler(pullSkillEvent => {
                    this.game.onceConditional('onPullSuccess', { 
                        condition: event => event.source === pullSkillEvent.properties.source &&
                            event.pullingDude === pullSkillEvent.properties.pullingDude
                    }, eventHandler);
                    pullSkillEvent.difficulty -= 2;
                    saveEventHandler(pullSkillEvent);
                    this.game.queueSimpleStep(() => { 
                        this.game.removeListener('onPullSuccess', eventHandler);
                    });     
                });
            }
        });
    }
}

WagnerMemorialRanch.code = '14015';

module.exports = WagnerMemorialRanch;
