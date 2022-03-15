const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TestOfWills extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Test of Wills',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a card to boot',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    booted: false
                },
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    if(['goods', 'spell'].includes(context.target.getType())) {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: ability.effects.blankExcludingKeywords
                        }));
                        this.game.addMessage('{0} uses {1} to boot {2} and it loses all abilities, traits, and bonuses', 
                            context.player, this, context.target);
                    } else {
                        this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);                        
                    }
                });
            }
        });

        this.reaction({
            title: 'React: Test of Wills',
            when: {
                onPossesFormed: () => this.game.shootout &&
                    this.game.shootout.getPosseStat(this.owner, 'bullets') > this.game.shootout.getPosseStat(this.owner.getOpponent(), 'bullets')
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent shootout plays to bring dudes into either posse or send dudes home booted', context.player, this),
            handler: context => {
                this.game.shootout.actOnAllParticipants(dude => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: dude,
                        effect: ability.effects.cannotLeaveShootout('any', context => context.ability && context.ability.playTypePlayed() === 'shootout')
                    }));
                });                
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout,
                    effect: [
                        ability.effects.cannotBringDudesIntoPosseByShootout()
                    ]
                }));                
            }
        });
    }
}

TestOfWills.code = '21056';

module.exports = TestOfWills;
