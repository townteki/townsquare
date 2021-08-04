const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class TrickShooting extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Trick Shooting',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(1)
                }));
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(['hearts', 'diams'].includes(pulledSuit.toLowerCase())) {
                        this.game.resolveGameAction(
                            GameActions.search({
                                title: 'Select 1 card to put to hand',
                                topCards: context.target.bullets,
                                location: ['draw deck'],
                                numToSelect: 1,
                                doNotShuffleDeck: true,
                                message: {
                                    format: '{player} uses {source}, gives {targetDude} +1 bullets , looks at {cardNum} cards from the top of their deck ' +
                                        'and puts one to their hand',
                                    args: { 
                                        targetDude: context => context.target,
                                        cardNum: context => context.target.bullets
                                    }
                                },
                                cancelMessage: {
                                    format: '{player} uses {source}, gives {targetDude} +1 bullets , looks at {cardNum} cards from the top of their deck, ' +
                                        'but does not put any card to their hand',
                                    args: { 
                                        targetDude: context => context.target,
                                        cardNum: context => context.target.bullets
                                    }
                                },
                                handler: (card) => {
                                    context.player.moveCard(card, 'hand');
                                }
                            }),
                            context
                        );
                    } else {
                        this.game.addMessage('{0} uses {1} and gives {2} +1 bullets but it fails because pulled card was not Hearts or Diams', 
                            context.player, this, context.target);
                    }
                }, true);
            }
        });
    }
}

TrickShooting.code = '25135';

module.exports = TrickShooting;
