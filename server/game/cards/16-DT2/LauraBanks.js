const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LauraBanks extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Laura Banks',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: `Increase or Decrease bounty on ${context.target.title}?`,
                        buttons: [
                            { 
                                text: 'Increase by 1', 
                                method: 'changeBountyLaura',
                                arg: 'increase',
                                disabled: !this.abilityContext.target.allowGameAction('addBounty')
                            },
                            { 
                                text: 'Decrease by 1', 
                                method: 'changeBountyLaura',
                                arg: 'decrease',
                                disabled: !this.abilityContext.target.allowGameAction('removeBounty') &&
                                    context.target.bounty > 0
                            }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    changeBountyLaura(player, arg) {
        if(arg === 'increase') {
            this.game.resolveGameAction(GameActions.addBounty({ card: this.abilityContext.target }), this.abilityContext);
        } else {
            this.game.resolveGameAction(GameActions.removeBounty({ card: this.abilityContext.target }), this.abilityContext);
        }
        this.game.addMessage('{0} uses {1} to {2} {3}\'s bounty by 1', player, this, arg, this.abilityContext.target);
        return true;
    }
}

LauraBanks.code = '24065';

module.exports = LauraBanks;
