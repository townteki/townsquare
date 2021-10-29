const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Champion extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Cheatin\' Resolution: Gain 1 GR',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.game.addMessage('{0} uses {1} to gain 1 GR', context.player, this);
                context.player.modifyGhostRock(1);
            },
            source: this
        });

        this.spellAction({
            title: 'Shootout: Boot to make stud',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a card to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true,
                    booted: false
                },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            difficulty: 8,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.setAsStud()
                    }));
                    this.game.addMessage('{0} uses {1} and boots {2} to make them a stud', 
                        context.player, this, context.target);
                });
                const eventHandler = () => {
                    context.player.modifyGhostRock(1);
                    this.game.addMessage('{0} gains 1 GR thanks to {1}', context.player, this);
                };
                this.game.onceConditional('onCardAced', {
                    until: 'onShootoutPhaseFinished',
                    condition: event => event.card === context.costs.boot
                }, eventHandler);
                this.game.onceConditional('onCardDiscarded', {
                    until: 'onShootoutPhaseFinished',
                    condition: event => event.card === context.costs.boot
                }, eventHandler);
            },
            source: this
        });
    }
}

Champion.code = '21049';

module.exports = Champion;
