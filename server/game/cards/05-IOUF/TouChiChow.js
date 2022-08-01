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
                condition: card => card.controller.equals(this.controller)
            }),
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose a dude to unboot',
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'any', 
                        booted: true,
                        condition: card => card.isNearby(context.costs.boot.gamelocation)
                    },
                    cardType: ['dude'],
                    gameAction: 'unboot',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.unbootCard({ card }), context);
                        this.game.addMessage('{0} uses {1}, booting {2} to unboot {3}',
                            player, this, context.costs.boot, card);
                        return true;
                    },
                    onCancel: player => {
                        this.game.addMessage('{0} uses {1} and boot {2}, but does not select any card to unboot',
                            player, this, context.costs.boot);
                        return true;                        
                    },
                    source: this
                });
            }
        });
    }

    getNumOfControlledDeeds() {
        return this.controller.cardsInPlay.reduce((num, card) => {
            if(card.getType() === 'deed' && card.controller.equals(this.controller)) {
                return num + 1;
            }
            return num;
        }, 0);
    }
}

TouChiChow.code = '09015';

module.exports = TouChiChow;
