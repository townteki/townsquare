const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SilasAimsExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: ability.effects.dynamicBullets(() => this.bounty > 4 ? 4 : this.bounty)
        });

        this.action({
            title: 'Silas Aims (Exp.1)',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            options: {
                skipCost: cost => cost.action.name === 'boot' &&
                    this.game.shootout && this.game.shootout.mark === this
            },
            target: {
                activePromptTitle: 'Choose a dude to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.bullets < this.bounty
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context);
            }
        });
    }
}

SilasAimsExp1.code = '20028';

module.exports = SilasAimsExp1;
