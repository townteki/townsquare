const DeedCard = require('../../deedcard.js');
const CardEntersPlayTracker = require('../../EventTrackers/CardEntersPlayTracker.js');

class TelegraphOffice extends DeedCard {
    setupCardAbilities(ability) {
        this.tracker = CardEntersPlayTracker.forPhase(this.game, event => event.card.getType() === 'dude');
        this.action({
            title: 'Telegraph Office',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude brought into play',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => this.tracker.events.some(event => event.card === card) 
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to gain {2} GR based on {3}\'s influence', context.player, this, context.target.influence, context.target),
            handler: context => {
                context.player.modifyGhostRock(context.target.influence);
            }
        });
    }
}

TelegraphOffice.code = '01080';

module.exports = TelegraphOffice;
