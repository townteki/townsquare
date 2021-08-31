const DeedCard = require('../../deedcard.js');
const GenericTracker = require('../../EventTrackers/GenericTracker.js');

class FlintsAmusements extends DeedCard {
    setupCardAbilities(ability) {
        this.tracker = GenericTracker.forRound(this.game, 'onCardAbilityResolved', event => event.ability.playTypePlayed('cheatin resolution'));
        this.traitReaction({
            when: {
                onCardPlayed: event => event.ability.playTypePlayed() === 'resolution' || event.ability.playTypePlayed() === 'cheatin resolution'
            },
            message: context =>
                this.game.addMessage('{0} gains 1 GR thanks to the {1}', context.player, this),
            handler: () => {
                this.controller.modifyGhostRock(1);
            }
        });
        this.action({
            title: 'Flint\'s Amusements',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.tracker.eventHappened(),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but does not draw a card because he did not play Cheatin\' Resolution this day.', context.player, this),
            message: context =>
                this.game.addMessage('{0} uses {1} to draw a card because he played Cheatin\' Resolution this day.', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

FlintsAmusements.code = '08010';

module.exports = FlintsAmusements;
