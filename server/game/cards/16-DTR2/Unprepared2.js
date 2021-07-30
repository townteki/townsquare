const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Unprepared2 extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Unprepare a dude',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2}, give them -1 bullets and prevent them from using abilities', 
                    context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-1),
                        ability.effects.cannotTriggerCardAbilities()
                    ]
                }));
            }
        });
        this.action({
            title: 'Unprepare up to 2 attachments on a dude',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select up to 2 attachments',
                    waitingPromptTitle: 'Waiting for opponent to select attachments',
                    cardCondition: card => card.location === 'play area' && card.parent === context.target,
                    cardType: ['goods', 'spell', 'action'],
                    multiSelect: true,
                    numCards: 2,
                    onSelect: (player, cards) => {
                        if(cards && cards.length > 0) {
                            player.bootCards(cards, context);
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: cards,
                                effect: [
                                    ability.effects.blankExcludingKeywords,
                                    ability.effects.setBullets(0),
                                    ability.effects.cannotTriggerCardAbilities()
                                ]
                            }));                     
                        }
                        this.game.addMessage('{0} uses {1} to boot {2}. These cards lose all traits, abilities, and bullet bonuses', 
                            context.player, this, cards);               
                        return true;
                    },
                    onCancel: () => {
                        this.game.addMessage('{0} uses {1} but does not select any attachments', context.player, this);
                    }
                });
            }
        });
    }
}

Unprepared2.code = '25138';

module.exports = Unprepared2;
