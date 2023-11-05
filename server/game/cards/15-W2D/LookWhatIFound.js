const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class LookWhatIFound extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Look What I Found!',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose non-Unique Weapon',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'discard pile', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('weapon') && !card.isUnique() 
                }
            },
            handler: context => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select your dude to receive weapon',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.isParticipating() && 
                        card.controller === context.player,
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playingType: 'ability',
                            abilitySourceType: 'card',
                            targetParent: dude
                        }, () => {
                            context.ability.selectAnotherTarget(context.player, context, {
                                activePromptTitle: 'Select a card to boot',
                                waitingPromptTitle: 'Waiting for opponent to select card',
                                cardCondition: card => card.parent === dude &&
                                    (card === context.target || card.hasKeyword('sidekick')),
                                gameAction: 'boot',
                                autoSelect: true,
                                onSelect: (player, cardToBoot) => {
                                    this.game.resolveGameAction(GameActions.bootCard({ card: cardToBoot }), context).thenExecute(() => {
                                        this.game.addMessage('{0} uses {1} and boots {2} to attach {2} to {3}', 
                                            player, this, cardToBoot, context.target, dude);
                                    });
                                    return true;
                                },
                                source: this
                            });
                        }), player, context.target);               
                        return true;
                    },
                    source: this
                });    
            }
        });
    }
}

LookWhatIFound.code = '23048';

module.exports = LookWhatIFound;
