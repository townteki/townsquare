const DudeCard = require('../../dudecard.js');

class XiangFang extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardEntersPlay: event => event.card === this
            },
            message: context => 
                this.game.addMessage('{0} gains {1} GR thanks to the {2}', 
                    context.player, this.locationCard.production, this),
            handler: context => {
                context.player.modifyGhostRock(this.locationCard.production);
                if(this.isAtHome || this.locationCard.owner !== context.player) {
                    this.untilEndOfPhase(context.ability, ability => ({
                        match: this.locationCard,
                        effect: ability.effects.setProduction(0)
                    }), 'upkeep'
                    );
                    this.game.addMessage('{0} uses {1} to set {2}\'s production to 0', 
                        context.player, this, this.locationCard);
                }
            }
        });
    }
}

XiangFang.code = '11004';

module.exports = XiangFang;
