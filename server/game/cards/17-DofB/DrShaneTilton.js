const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');

class DrShaneTilton extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Boot a dude',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude to boot',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                if(context.target.hasKeyword('abomination')) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: [
                            ability.effects.modifyBullets(2)
                        ]
                    }));
                    this.game.addMessage('{0} uses {1} to boot {2} and gains +2 bullets', context.player, this, context.target);
                } else {
                    this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);
                }
            }
        });
    }
}

DrShaneTilton.code = '25020';

module.exports = DrShaneTilton;
