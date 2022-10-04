const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AdlersNeedle extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Adler\'s Needle',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    participating: false,
                    condition: card => card.isNearby(this.gamelocation) 
                },
                cardType: ['dude'],
                gameAction: 'joinPosse'
            },
            handler: context => {
                this.game.promptForYesNo(context.player.getOpponent(), {
                    title: `Do you want ${context.target.title} to join posse?`,
                    onYes: () => {
                        this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, context.target);
                        });
                    },
                    onNo: player => {
                        this.parent.modifyControl(1);
                        this.game.addMessage('{0} uses {1} and attempts to bring {2} into posse, but {3} decides not to, ' +
                            'therefore {4} gains 1 CP', context.player, this, context.target, player, this.parent);
                        if(this.parent.getGrit(context) > context.target.getGrit(context)) {
                            this.untilEndOfRound(context.ability, ability => ({
                                condition: () => !context.target.isAtHome(),
                                match: context.target,
                                effect: ability.effects.modifyInfluence(-1)
                            }));  
                            this.game.addMessage('{0} uses {1} to give {2} -1 influence while not at home because {3} decided ' +
                                'not to join {2} to posse', context.player, this, context.target, player);
                        }
                    },
                    source: this
                });
            }
        });
    }
}

AdlersNeedle.code = '21046';

module.exports = AdlersNeedle;
