const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FleetFooted extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Send your dude home booted',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
            }
        });

        this.action({
            title: 'Shootout: Give your dude +1 and opposing dude -1 bullets',
            playType: ['shootout'],
            targets: {
                yourDude: {
                    activePromptTitle: 'Choose your dude',
                    choosingPlayer: 'current',
                    cardCondition: { location: 'play area', controller: 'current', participating: true },
                    cardType: ['dude']
                },
                oppDude: {
                    activePromptTitle: 'Choose opposing dude',
                    choosingPlayer: 'current',
                    cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                    cardType: ['dude']
                }
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} +1 bullets and {3} -1 bullets', 
                    context.player, this, context.targets.yourDude, context.targets.oppDude),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.targets.yourDude,
                    effect: ability.effects.modifyBullets(1)
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.targets.oppDude,
                    effect: ability.effects.modifyBullets(-1)
                }));                
            }
        });
    }
}

FleetFooted.code = '21053';

module.exports = FleetFooted;
