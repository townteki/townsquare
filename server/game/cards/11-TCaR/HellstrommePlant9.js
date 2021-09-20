const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HellstrommePlant9 extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon/Shootout: Hellstromme Plant #9',
            playType: ['noon', 'shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1)
            ],
            target: {
                activePromptTitle: 'Choose a Horse or Gadget',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.parent &&
                        card.parent.owner === this.controller &&
                        (card.hasKeyword('gadget') || card.hasKeyword('horse'))
                }
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                this.context = context;
                const abilities = context.target.abilities.actions.concat(context.target.abilities.reactions);
                if(abilities.length === 0) {
                    this.game.addMessage('{0} uses {1} on {2}, but it does not have any ability to refresh', context.player, this, context.target);
                    return;
                }
                if(abilities.length > 1) {
                    const buttons = abilities.map(ability => {
                        return { text: ability.title, arg: ability.title, method: 'refreshAbility' };
                    });
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Select ability to refresh',
                            buttons: buttons
                        },
                        source: this
                    });
                } else {
                    this.context.defaultAbility = true;
                    this.refreshAbility(context.player, abilities[0].title);
                }                
            }
        });
    }

    refreshAbility(player, arg) {
        const selectedAbility = this.context.target.abilities.actions.concat(this.context.target.abilities.reactions)
            .find(ability => ability.title === arg);
        if(selectedAbility) {
            selectedAbility.resetAbilityUsage();            
        }
        if(this.context.defaultAbility) {
            this.game.addMessage('{0} uses {1} on {2} to refresh its ability', player, this, this.context.target);
        } else {
            this.game.addMessage('{0} uses {1} on {2} to refresh "{3}" ability', player, this, this.context.target, arg);
        }
    }    
}

HellstrommePlant9.code = '19026';

module.exports = HellstrommePlant9;
