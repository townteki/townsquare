const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class JohnAcesRadcliffeExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords(['gadget'], ['weapon']),
            match: this,
            effect: ability.effects.setAsStud()
        });

        this.persistentEffect({
            condition: () => true,
            match: card => this.equals(card.parent),
            effect: ability.effects.cannotBeTraded()
        });

        this.reaction({
            title: 'React: John "Aces" Radcliffe',
            when: {
                onCardEntersPlay: event => event.card === this
            },
            target: {
                activePromptTitle: 'Select a Gadget Weapon',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: ['hand', 'discard pile'], 
                    controller: 'current', 
                    condition: card => card.hasAllOfKeywords(['gadget', 'weapon'])
                },
                cardType: ['goods']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to equip him with a {2}', context.player, this, context.target),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onCardAbilityResolved: event => event.ability === context.ability
                    },
                    match: context.target,
                    effect: ability.effects.doesNotHaveToBeInvented()
                }), null, context.target.location);
                if(context.target.location === 'hand') {
                    this.game.resolveGameAction(GameActions.putIntoPlay({
                        player: context.player,
                        card: context.target,
                        params: {
                            playingType: 'ability',
                            targetParent: this,
                            context
                        }
                    }), context);
                } else {
                    this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                        playType: 'ability',
                        abilitySourceType: 'ability',
                        targetParent: this
                    }), context.player, context.target);                     
                }
            }
        });
    }
}

JohnAcesRadcliffeExp1.code = '23026';

module.exports = JohnAcesRadcliffeExp1;
