const PhaseNames = require('../../Constants/PhaseNames.js');
const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class CaliforniaTaxOffice extends DeedCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.entersPlayBooted = true;
    }
    setupCardAbilities(ability) {
        this.action({
            title: 'California Tax Office',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to demand upkeep for {2}', context.player, this, context.target),
            handler: context => {
                const taxPayer = context.target.controller;
                if(taxPayer.getSpendableGhostRock() >= context.target.upkeep) {
                    this.game.promptForYesNo(taxPayer, {
                        title: `Do you want to pay ${context.target.upkeep} GR upkeep for ${context.target.title} ?`,
                        onYes: player => {
                            player.spendGhostRock(context.target.upkeep);
                            this.untilEndOfPhase(context.ability, ability => ({
                                condition: () => true,
                                match: context.target,
                                effect: ability.effects.modifyUpkeep(-1 * context.target.upkeep)
                            }), PhaseNames.Upkeep
                            );
                            this.game.addMessage('{0} decided to pay upkeep for {1} to {2}', player, context.target, this);
                        },
                        onNo: player => {
                            this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                            this.game.addMessage('{0} decided not to pay upkeep for {1} to {2} and discard them', player, context.target, this);
                        }
                    });
                } else {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                    this.game.addMessage('{0} has to discard {1} because they do not have enough GR to pay upkeep to {2}', taxPayer, context.target, this);
                }
            }
        });
    }
}

CaliforniaTaxOffice.code = '05021';

module.exports = CaliforniaTaxOffice;
