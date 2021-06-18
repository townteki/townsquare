const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class PapaMarias extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Papa Marias',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose your unbooted huckster',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('huckster') && !card.booted && card.locationCard !== this.locationCard
                },
                cardType: ['dude']
            },
            handler: context => {
                const skillRating = this.getSkillRating('huckster');
                context.player.pullForSkill(7, skillRating, {
                    successHandler: context => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: this.gamelocation
                        }));
                        this.game.addMessage('{0} uses {1} to move {2} to {1}\'s location', context.player, this, context.target);
                    },
                    pullingDude: this,
                    source: this
                }, context);
            }
        });
    }
}

PapaMarias.code = '20014';

module.exports = PapaMarias;
