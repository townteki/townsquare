const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class BBAttorneys extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'B & B Attorneys',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a wanted dude',
                cardCondition: { location: 'play area', wanted: true },
                cardType: ['dude'],
                gameAction: { or: ['addBounty', 'removeBounty'] }
            },
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Raise or lower the bounty by one?',
                        buttons: [
                            {
                                text: 'Raise by one',
                                method: 'raise',
                                disabled: !this.abilityContext.target.allowGameAction('addBounty', this.abilityContext)
                            },
                            {
                                text: 'Lower by one',
                                method: 'lower',
                                disabled: !this.abilityContext.target.allowGameAction('removeBounty', this.abilityContext)
                            }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    raise(player) {
        this.applyBountyEffect(player, 1);
        return true;
    }

    lower(player) {
        this.applyBountyEffect(player, -1);
        return true;
    }

    applyBountyEffect(player, amount) {
        let text = 'raise';
        if(amount < 0) {
            text = 'lower';
            this.game.resolveGameAction(GameActions.removeBounty({ card: this.abilityContext.target }), this.abilityContext);
        } else {
            this.game.resolveGameAction(GameActions.addBounty({ card: this.abilityContext.target }), this.abilityContext);
        }

        this.game.addMessage('{0} uses {1} to {2} {3}\'s bounty by one', player, this, text, this.abilityContext.target);
    }
}

BBAttorneys.code = '01061';

module.exports = BBAttorneys;
