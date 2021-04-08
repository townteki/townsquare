const SpellCard = require('../../spellcard.js');

class Consecration extends SpellCard {
    setupCardAbilities() {
        this.spellAction({
            title: 'Consecration',
            playType: 'cheatin resolution',
            target: {
                activePromptTitle: 'Select your dude to Consecrate',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { location: 'play area', controller: 'current'},
                cardType: ['dude']
            },
            difficulty: 7,
            onSuccess: (context) => {
                this.untilEndOfRound(ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(2),
                        ability.effects.modifyInfluence(2),
                        ability.effects.setAsStud()
                    ]
                }));
                this.game.addMessage('{0} uses {1} to increase {2}\'s bullets and influence by 2 and make them a stud', context.player, this, context.target);
                /* Check if this is a shootout and if so, reduce casualties */
                if(this.game.shootout) {
                    context.player.modifyCasualties(-3);
                    this.game.addMessage('{0} also uses {1} to reduce their casualties by 3 this round', context.player, this);
                }
            },
            source: this
        });
    }
}

Consecration.code = '07017';

module.exports = Consecration;
