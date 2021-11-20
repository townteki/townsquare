const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class LeonardoLeonCavallo extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Leonardo Cavallo',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: {
                    location: 'play area',
                    controller: 'any',
                    condition: card =>
                        card.gamelocation === this.gamelocation ||
                        card.isAdjacent(this.gamelocation)
                },
                cardType: ['dude']
            },
            handler: context => {
                const skillRating = this.getSkillRating('huckster');
                context.player.pullForSkill(context.target.value, skillRating, {
                    successHandler: context => {
                        this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} has {1} boot {2}', context.player, this, context.target);
                        });
                    },
                    pullingDude: this,
                    source: this
                }, context);
            }
        });
    }
}

LeonardoLeonCavallo.code = '03001';

module.exports = LeonardoLeonCavallo;
