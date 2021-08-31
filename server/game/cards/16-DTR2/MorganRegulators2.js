const GenericTracker = require('../../EventTrackers/GenericTracker.js');
const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class MorganRegulators2 extends OutfitCard {
    setupCardAbilities(ability) {
        this.tracker = GenericTracker.forRound(this.game, 'onShootoutPhaseStarted');
        this.persistentEffect({
            condition: () => !this.tracker.eventHappened(),
            match: this.game.getPlayers(),
            effect: ability.effects.setMaxInfByLocation(5)
        });

        this.action({
            title: 'Morgan Regulators',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => !card.isInTownSquare() 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({
                    card: context.target,
                    targetUuid: this.game.townsquare.uuid
                }), context);
                if(context.target.hasHorse() && context.target.booted) {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                    this.game.addMessage('{0} uses {1} to move {2} to Town Square and unboots them', 
                        context.player, this, context.target);
                } else {
                    this.game.addMessage('{0} uses {1} to move {2} to Town Square', 
                        context.player, this, context.target);
                }
            }
        });
    }
}

MorganRegulators2.code = '25096';

module.exports = MorganRegulators2;
