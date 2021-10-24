const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FullMoonBrotherhood extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Full Moon Brotherhood',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => !card.isToken() &&
                        this.owner.cardsInPlay.some(cardInPlay => cardInPlay.getType() === 'dude' &&
                            cardInPlay.isAdjacent(card.gamelocation))
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} on {2} who loses all traits, cannot move via card effects, ' +
                    'and cannot refuse callouts', context.player, this, context.target),
            handler: context => {
                this.abilityContext = context;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.traitBlank,
                        ability.effects.cannotBeMovedViaCardEffects(),
                        ability.effects.cannotRefuseCallout()
                    ]
                }));
                const eventHandler = () => {
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Choose one',
                            buttons: [
                                { text: 'Draw 2 cards', method: 'fmbBonus', arg: 'draw' },
                                { text: 'Gain 2 GR', method: 'fmbBonus', arg: 'gainGR' }
                            ]
                        },
                        source: this
                    });
                };
                this.game.onceConditional('onCardLeftPlay', { 
                    condition: event => event.card === context.target 
                }, () => eventHandler());
                this.game.once('onRoundEnded', () => this.game.removeListener('onCardLeftPlay', eventHandler));
            }
        });
    }

    fmbBonus(player, arg) {
        if(arg === 'draw') {
            player.drawCardsToHand(2, this.abilityContext);
            this.game.addMessage('{0} draws 2 cards thanks to {1}', player, this);
        }
        if(arg === 'gainGR') {
            player.modifyGhostRock(2);
            this.game.addMessage('{0} gains 2 GR thanks to {1}', player, this);
        }
        return true;
    }
}

FullMoonBrotherhood.code = '18003';

module.exports = FullMoonBrotherhood;
