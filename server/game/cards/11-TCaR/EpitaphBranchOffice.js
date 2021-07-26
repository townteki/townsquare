const DeedCard = require('../../deedcard.js');

class EpitaphBranchOffice extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Epitaph Branch Office',
            cost: ability.costs.bootSelf(),
            when: {
                onSundownAfterVictoryCheck: () => this.controller.cardsInPlay.some(card => card.getType() === 'dude' &&
                    card.control === 0 && card.influence >= 1 && card.isInOpponentsHome())
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.controller === context.player && card.control === 0 && 
                        card.influence >= 1 && card.isInOpponentsHome(),
                    cardType: 'dude',
                    multiSelect: false,
                    numCards: 1,
                    onSelect: (player, card) => {
                        card.modifyControl(1);
                        this.game.addMessage('{0} uses {1} to give {2} +1 permanent CP', player, this, card);
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

EpitaphBranchOffice.code = '19022';

module.exports = EpitaphBranchOffice;
