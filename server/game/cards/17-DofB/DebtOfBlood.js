const ActionCard = require('../../actioncard.js');
const GenericTracker = require('../../EventTrackers/GenericTracker.js');

class DebtOfBlood extends ActionCard {
    setupCardAbilities() {
        this.trackerAce = GenericTracker.forRound(this.game, 'onCardAced', event => {
            const isOpposingCardEffect = event.context && event.context.player === event.card.controller.getOpponent() && event.isCardEffect;
            return event.card.getType() === 'dude' && event.card.controller === this.controller && (event.isCasualty || isOpposingCardEffect);
        }); 
        this.trackerDiscard = GenericTracker.forRound(this.game, 'onCardDiscarded', event => {
            const isOpposingCardEffect = event.context && event.context.player === event.card.controller.getOpponent() && event.isCardEffect;
            return event.card.getType() === 'dude' && event.card.controller === this.controller && (event.isCasualty || isOpposingCardEffect);
        }); 

        this.action({
            title: 'Shootout: Debt of Blood',
            playType: ['shootout'],
            ifCondition: () => this.trackerAce.eventHappened() || this.trackerDiscard.eventHappened(),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1}, but it fails because none of their dudes was aced or discarded this turn', 
                    context.player, this),
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to give {2} +3 bullets and make them a stud', 
                context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(3),
                        ability.effects.setAsStud()
                    ]
                }));
            }
        });

        this.action({
            title: 'Noon: Debt of Blood',
            playType: ['noon'],
            ifCondition: () => this.trackerAce.eventHappened(),
            ifFailMessage: context => this.game.addMessage('{0} uses {1}, but it fails because none of their dudes was aced this turn', 
                context.player, this),
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to give {2} +3 bullets and make them a stud', 
                context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(3),
                        ability.effects.setAsStud()
                    ]
                }));
            }
        });        
    }
}

DebtOfBlood.code = '25054';

module.exports = DebtOfBlood;
