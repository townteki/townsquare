const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
const StandardActions = require('../../PlayActions/StandardActions.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JanoszPratt extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Janosz Pratt',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a Weapon',
                cardCondition: { 
                    location: 'discard pile', 
                    controller: 'current', 
                    allKeywords: ['gadget', 'weapon']
                }
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onJanoszPrattFinished: () => true
                    },
                    match: context.target,
                    targetLocation: context.target.location,
                    effect: ability.effects.canBeInventedWithoutBooting()
                }));

                this.game.once('onRoundEnded', () => {
                    if(context.target.locaiton === 'play area') {
                        this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} discards {1} at the end of a turn because it was invented by {2}', 
                                context.player, context.target, this);
                        });
                    }
                });

                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: `Choose dude to wield ${context.target.title}`,
                    cardCondition: { 
                        location: 'play area',
                        controller: 'current',
                        participating: true
                    },
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playType: 'ability',
                            abilitySourceType: 'card',
                            scientist: this,
                            targetParent: dude,
                            reduceAmount: 2
                        }, () => {
                            this.game.addMessage('{0} invents {1} without booting thanks to {2}', player, dude, this);
                        }), player, dude);                        
                        return true;
                    },
                    source: this,
                    context
                });                   
                this.game.queueSimpleStep(() => { 
                    this.game.raiseEvent('onJanoszPrattFinished'); 
                });                       
            }
        });
    }
}

JanoszPratt.code = '13005';

module.exports = JanoszPratt;
