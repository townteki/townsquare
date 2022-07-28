const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class JonahsAlliance extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Jonah\'s Alliance',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.getType() === 'dude' &&
                    !card.isAtHome()
                )
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} and chooses {2} who becomes stud, uses bullets to control deeds and gains 2 bounty', 
                    context.player, this, context.costs.boot),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.costs.boot,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.determineControlByBullets()
                    ]
                }));
                this.game.resolveGameAction(GameActions.addBounty({ 
                    card: context.costs.boot,
                    amount: 2,
                    maxAmount: 4
                }), context);
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a hex',
                    waitingPromptTitle: 'Waiting for opponent to select hex',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller &&
                        card.getType() === 'spell' &&
                        card.isHex(),
                    gameAction: 'boot',
                    onSelect: (player, hex) => {
                        this.game.resolveGameAction(GameActions.bootCard({ card: hex }), context).thenExecute(() => {
                            context.ability.selectAnotherTarget(player, context, {
                                activePromptTitle: 'Select an attachment to blank',
                                waitingPromptTitle: 'Waiting for opponent to select attachment',
                                cardCondition: card => card.location === 'play area' &&
                                    card.parent && card.parent.gamelocation === context.costs.boot.gamelocation,
                                onSelect: (player, attachment) => {
                                    this.applyAbilityEffect(context.ability, ability => ({
                                        match: attachment,
                                        effect: [
                                            ability.effects.blankExcludingKeywords,
                                            ability.effects.bulletBonusBlank,
                                            ability.effects.cannotTriggerCardAbilities()
                                        ]
                                    }));
                                    this.game.addMessage('{0} uses {1} and boots {2} to remove all traits, bullet bonuses and abilities from {3}', 
                                        player, this, hex, attachment);
                                    return true;
                                },
                                source: this
                            });
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

JonahsAlliance.code = '21006';

module.exports = JonahsAlliance;
