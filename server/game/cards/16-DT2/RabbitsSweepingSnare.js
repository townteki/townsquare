const TechniqueCard = require('../../techniquecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RabbitsSweepingSnare extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Shootout: Rabbit\'s Sweeping Snare',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsDraw()
                }));
                this.game.addMessage('{0} uses {1} to set {2} as draw', context.player, this, context.target);
                let myDudes = this.game.shootout.getPosseByPlayer(this.controller).getDudes();
                let oppDudes = this.game.shootout.getPosseByPlayer(this.controller.getOpponent()).getDudes();
                if(myDudes.length <= oppDudes.length) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select cards to boot',
                        waitingPromptTitle: 'Waiting for opponent to select cards',
                        cardCondition: card => card.parent === context.target,
                        gameAction: 'boot',
                        multiSelect: true,
                        numCards: 2,
                        onSelect: (player, cards) => {
                            player.bootCards(cards, context, bootedCards => 
                                this.game.addMessage('{0} uses {1} to boot {2}', player, this, bootedCards));
                            return true;
                        }
                    });
                }
            },
            source: this
        });
    }
}

RabbitsSweepingSnare.code = '24241';

module.exports = RabbitsSweepingSnare;
