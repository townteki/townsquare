const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class BioChargedNeutralizer2 extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, { providesStudBonus: true });
    }

    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.cannotBeTraded(),
                ability.effects.cannotBeAffected('opponent', context => context.ability && context.ability.isCardAbility())
            ]
        });
        this.action({
            title: 'Bio-Charged Neutralizer',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.pull()
            ],
            handler: context => {
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to pull {2} and has to discard it because it is a club', 
                            context.player, this, context.pull.pulledCard);
                    });
                } else {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select a dude for trade',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => card.location === 'play area' &&
                            card.controller === this.controller &&
                            card.gamelocation === this.gamelocation,
                        cardType: 'dude',
                        onSelect: (player, card) => {
                            player.attach(this, card, 'ability', () => {
                                this.game.addMessage('{0} uses {1} to attach it to {2}', player, this, card);                                
                            });
                            return true;
                        },
                        source: this
                    });
                }
            }
        });
    }
}

BioChargedNeutralizer2.code = '24176';

module.exports = BioChargedNeutralizer2;
