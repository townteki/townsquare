const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NathanielTuwikaa extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Nathaniel Tuwikaa',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose dude to callout',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: 'callout'
            },
            message: context => this.game.addMessage('{0} uses {1} to call out {2} and to use influence rather than bullet rating for shootout', 
                context.player, this, context.target),
            handler: context => {
                let eventHandler = () => {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutPhaseFinished: () => true
                        },
                        match: this.game.shootout,
                        effect: ability.effects.useInfluenceForShootout()
                    }), context.causedByPlayType);
                };
                this.game.once('onShootoutPhaseStarted', eventHandler);
                this.game.onceConditional('onCardAbilityResolved', { condition: event => event.ability === context.ability },
                    () => this.game.removeListener('onShootoutPhaseStarted', eventHandler));            
            }
        });
    }
}

NathanielTuwikaa.code = '21018';

module.exports = NathanielTuwikaa;
