const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Unprepared extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Unprepared',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                choosingPlayer: 'current',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to catch {2} with his pants down', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-1),
                        ability.effects.cannotTriggerCardAbilities()
                    ]
                }));
                if(context.target.attachments.length > 0) {
                    context.player.bootCards(context.target.attachments, context);
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target.attachments,
                        effect: [
                            ability.effects.blankExcludingKeywords,
                            ability.effects.setBullets(0),
                            ability.effects.cannotTriggerCardAbilities()
                        ]
                    }));                     
                }
            }
        });
    }
}

Unprepared.code = '01134';

module.exports = Unprepared;
