const ActionCard = require('../../actioncard.js');

class BadCompany extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Bad Company',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude that is a really bad company',
                cardCondition: { location: 'play area', controller: 'any', wanted: true },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(3),
                        ability.effects.setAsStud()
                    ]
                }));
                this.game.onceConditional('onBountyCollected', { condition: event => event.card === context.target }, 
                    event => {
                        event.collector.modifyGhostRock(4);
                        this.game.addMessage('{0} collects 4 extra ghost rock for bounty on {1} who was a really {2}. ', context.player, context.target, this);
                    }
                );
                this.game.addMessage('{0} uses {1} to give {2} +3 bullets and make them a stud. ' +
                    'If any player collects bounty on that dude this turn, they gain 4 extra ghost rock. ', context.player, this, context.target);
            }
        });
    }
}

BadCompany.code = '01117';

module.exports = BadCompany;
