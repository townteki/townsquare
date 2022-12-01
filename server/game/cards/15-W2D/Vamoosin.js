const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Vamoosin extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Vamoosin\'',
            playType: ['shootout'],
            cost: ability.costs.payGhostRock(context => context.target.influence, false, 
                context => this.minInfWanted(context)),
            target: {
                activePromptTitle: 'Choose dude to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    participating: true,
                    wanted: true,
                    condition: (card, context) => 
                        card.influence <= context.player.getSpendableGhostRock({ 
                            activePlayer: context.player,
                            context 
                        })
                },
                cardType: ['dude'],
                gameAction: 'sendHome'
            },
            handler: context => {
                this.game.shootout.sendHome(context.target, context, { needToBoot: false })
                    .thenExecute(() => this.game.addMessage('{0} uses {1} and pays {2} GR to send {3} home', 
                        context.player, this, context.target.influence, context.target
                    ));
            }
        });
    }

    minInfWanted() {
        if(!this.game.shootout) {
            return 0;
        }
        return this.game.shootout.getParticipants().reduce((minInf, dude) => {
            if(!dude.isWanted() || dude.influence > minInf) {
                return minInf;
            }
            return dude.influence;
        }, 999);
    }
}

Vamoosin.code = '23056';

module.exports = Vamoosin;
