const DudeCard = require('../../dudecard.js');

class Skinwalker extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Skinwalker',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.getType() === 'dude' &&
                card.hasKeyword('abomination') &&
                this.game.shootout &&
                this.game.shootout.getPosseByPlayer(this.controller).isInPosse(card)
            ),
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Boot opposing attachment at this location or give +2 bullets to Skinwalker?',
                        buttons: [
                            { text: 'Boot attachment', method: 'bootAttachment' },
                            { text: 'Give bullets', method: 'giveBullets' }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    bootAttachment() {
        // @todo implement [ST 2021/10/26]
    }

    giveBullets(player) {
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this,
            effect: ability.effects.modifyBullets(1)
        }));
        this.game.addMessage('{0} uses {1} and boots {2} to give {3} +2 bullets', player, this, this.abilityContext.costs.boot, this);
        return true;
    }
}

Skinwalker.code = '20015';

module.exports = Skinwalker;
