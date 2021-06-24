const SpellCard = require('../../spellcard.js');

class Forget extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Forget',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude with ability',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.gamelocation === this.gamelocation || card.isAdjacent(this.gamelocation) 
                },
                cardType: ['dude']
            },
            difficulty: 5,
            onSuccess: (context) => {
                this.context = context;
                const abilities = context.target.abilities.actions.concat(context.target.abilities.reactions).filter(ability => ability.printed);
                if(abilities.length === 0) {
                    this.game.addMessage('{0} uses {1} on {2}, but they do not have any printed ability to forget', context.player, this, context.target);
                    return;
                }
                if(abilities.length > 1) {
                    const buttons = abilities.map(ability => {
                        return { text: ability.title, arg: ability.title, method: 'blankAbility' };
                    });
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Select ability to blank',
                            buttons: buttons
                        },
                        source: this
                    });
                } else {
                    this.context.defaultAbility = true;
                    this.blankAbility(context.player, abilities[0].title);
                }
            },
            source: this
        });
    }

    blankAbility(player, arg) {
        this.untilEndOfRound(this.context.ability, ability => ({
            match: this.context.target,
            effect: ability.effects.cannotTriggerCardAbilities(ability => ability.title === arg)
        }));
        if(this.context.defaultAbility) {
            this.game.addMessage('{0} uses {1} on {2} to forget their ability', player, this, this.context.target);
        } else {
            this.game.addMessage('{0} uses {1} on {2} to forget "{3}" ability', player, this, this.context.target, arg);
        }
    }
}

Forget.code = '02017';

module.exports = Forget;
