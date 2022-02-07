const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class InnerStruggle extends ActionCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.parent && this.parent.controller.isCheatin() && !this.owner.isCheatin() && !this.booted
            },
            ignoreActionCosts: true,
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this}), context).thenExecute(() => {
                    this.game.addMessage('{0} boots {1} due to the enormity of their cheatin', this.controller, this);
                });
            }
        });

        this.persistentEffect({
            location: 'play area',
            condition: () => this.game.shootout,
            match: this.controller,
            effect: ability.effects.dynamicHandRankMod(() => this.booted ? -1 : 0)
        });

        this.action({
            title: 'Inner Struggle',
            playType: 'cheatin resolution',
            handler: context => {
                const theirhome = context.player.getOpponent().getOutfitCard();
                context.player.attach(this, theirhome, 'ability', () => {
                    this.booted = true;
                    this.controller.discardAtRandom(1, discarded => {
                        this.game.addMessage('{0} uses {1}, attaches it to {2} and {3} randomly discards {4}', 
                            context.player, this, theirhome, this.controller, discarded);
                    });
                });
            }
        });
    }
}

InnerStruggle.code = '16017';

module.exports = InnerStruggle;
