const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Lethargy extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Lethargy',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    booted: false,
                    condition: card => card.isNearby(this.gamelocation) 
                },
                cardType: ['dude']
            },
            difficulty: context => context.target.getGrit(),
            onSuccess: (context) => {
                this.game.addMessage('{0} uses {1} to prevent {2}\'s unboot at Nightfall unless their controller pays 1 GR', 
                    context.player, this, context.target);
                this.game.once('onNightfallUnbooting', () => {
                    if(context.target.booted && context.target.controller !== context.player) {
                        if(context.target.controller.getSpendableGhostRock() > 0) {
                            this.game.promptForYesNo(context.target.controller, {
                                title: `Do you want to pay 1 GR to have ${context.target.title} unbooted?`,
                                onYes: player => {
                                    player.spendGhostRock(1);
                                    this.game.addMessage('{0} pays 1 GR to remove {1} from {2} who can unboot at Nightfall', 
                                        context.target.controller, this, context.target);
                                },
                                onNo: player => {
                                    this.untilEndOfRound(context.ability, ability => ({
                                        match: context.target,
                                        effect: ability.effects.doesNotUnbootAtNightfall()
                                    }));
                                    this.game.addMessage('{0} does not want to pay 1 GR to remove {1}, therefore {2} does not unboot at Nightfall', 
                                        player, this, context.target);
                                }
                            });
                        } else {
                            this.untilEndOfRound(context.ability, ability => ({
                                match: context.target,
                                effect: ability.effects.doesNotUnbootAtNightfall()
                            }));
                            this.game.addMessage('{0} cannot pay 1 GR, therefore {2} does not unboot at Nightfall due to {3}', 
                                context.target.controller, context.target, this);
                        }
                    }
                });
            },
            source: this
        });
    }
}

Lethargy.code = '22045';

module.exports = Lethargy;
