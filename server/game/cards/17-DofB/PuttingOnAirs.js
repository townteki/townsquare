const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');

class PuttingOnAirs extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Putting On Airs',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyInfluence(1),
                        ability.effects.cannotMakeCallout(),
                        ability.effects.cannotJoinPosse(this, posse => posse && posse.isLeading)
                    ]
                }));
                const message = '{0} uses {1} to give {2} +1 influence';
                const suffix = ' and they cannot make callouts or join the leader\'s posse';
                if(context.target.bounty) {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to remove bounty from ${context.target.title} ?`,
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.removeBounty({ card: context.target }), context).thenExecute(() => {
                                this.game.addMessage(message + ' , remove a bounty from them' + suffix, 
                                    player, this, context.target);
                            });
                        },
                        onNo: player => {
                            this.game.addMessage(message + suffix, player, this, context.target);
                        },
                        source: this
                    });
                } else {
                    this.game.addMessage(message + suffix, context.player, this, context.target);
                }
            }
        });
    }
}

PuttingOnAirs.code = '25052';

module.exports = PuttingOnAirs;
