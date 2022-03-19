const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class TouChiChow extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.getFaction() === Factions.Anarchists, 
            effect: ability.effects.reduceSelfCost('any', () => this.getNumOfControlledDeeds())
        });

        this.action({
            title: 'T\'ou Chi Chow',
            playType: ['noon', 'shootout'],
            repeatable: true,
            cost: ability.costs.boot({
                type: 'deed',
                condition: card => card.controller === this.controller
            }),
            target: {
                activePromptTitle: 'Choose a dude to unboot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.isNearby(context.costs.boot)
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1}, booting {2} to unboot {3}',
                context.player, this, context.costs.boot, context.target),
            handler: context => this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context)
        });
    }

    getNumOfControlledDeeds() {
        return this.controller.cardsInPlay.reduce((num, card) => {
            if(card.getType() === 'deed' && card.controller === this.controller) {
                return num + 1;
            }
            return num;
        }, 0);
    }
}

TouChiChow.code = '09015';

module.exports = TouChiChow;
