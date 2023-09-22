const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TseCheNakosWeaving extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.locationCard && this.locationCard.getType() === 'deed',
            effect: [
                ability.effects.addKeyword('holy ground'),
                ability.effects.doesNotUnbootAtNightfall()
            ]
        });

        this.spellAction({
            title: 'Noon: Tse-Che-Nako\'s Weaving',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: (context) => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose dude to move',
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'current'
                    },
                    cardType: ['dude'],
                    gameAction: 'moveDude',
                    onSelect: (player, dude) => {
                        this.game.promptForLocation(player, {
                            activePromptTitle: 'Select destination',
                            cardCondition: { 
                                condition: card => card.isAdjacent(context.caster.gamelocation) &&
                                    card.gamelocation !== dude.gamelocation
                            },
                            onSelect: (player, location) => {
                                this.game.resolveGameAction(GameActions.moveDude({ 
                                    card: dude, 
                                    targetUuid: location.uuid
                                }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);
                                });
                                return true;
                            },
                            source: this,
                            context
                        });
                        const totemLocationCard = this.locationCard;
                        if(totemLocationCard && totemLocationCard.booted) {
                            this.game.promptForYesNo(player, {
                                title: `Do you want to unboot ${totemLocationCard.title} ?`,
                                onYes: player => {
                                    this.game.resolveGameAction(GameActions.unbootCard({ card: totemLocationCard }), context).thenExecute(() => {
                                        this.lastingEffect(context.ability, ability => ({
                                            until: {
                                                onRoundEnded: () => true,
                                                onDudeMoved: event => event.card === context.caster
                                            },
                                            match: context.caster,
                                            effect: ability.effects.modifyControl(1)
                                        }));
                                        this.game.addMessage('{0} uses {1} to unboot {2} and to give {3} +1 CP until they move (or until end of turn)', 
                                            player, this, totemLocationCard, context.caster);                                 
                                    });
                                },
                                source: this
                            });
                        }
                        return true;
                    },
                    source: this,
                    context
                });
            },
            source: this
        });
    }
}

TseCheNakosWeaving.code = '18032';

module.exports = TseCheNakosWeaving;
