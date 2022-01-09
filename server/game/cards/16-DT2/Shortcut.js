const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');

class Shortcut extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Noon: Move dude',
            playType: ['noon'],
            targets: {
                dudeToMove: {
                    activePromptTitle: 'Choose your dude',
                    cardCondition: { location: 'play area', controller: 'current', booted: false },
                    cardType: ['dude'],
                    gameAction: 'moveDude'
                }, 
                destination: { cardType: 'location' }
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to {3}', 
                    context.player, this, context.targets.dudeToMove, context.targets.destination),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.targets.dudeToMove, 
                    targetUuid: context.targets.destination.uuid 
                }), context);
            }
        });
        this.reaction({
            title: 'React: Prevent booting',
            when: {
                onDudeJoiningPosse: event => 
                    event.card.controller === this.owner &&
                    event.card.isAdjacent(this.game.shootout.shootoutLocation.uuid) &&
                    event.card.requirementsToJoinPosse().needToBoot
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent {2} from booting when joining posse', 
                    context.player, this, context.event.card),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPossesGathered: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: context.event.card,
                    effect: ability.effects.canJoinWithoutBooting()
                }));
            }
        });
    }
}

Shortcut.code = '24243';

module.exports = Shortcut;
