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
                this.game.shootout.getPosseByPlayer(this.controller).isInPosse(card)
            ),
            handler() {
                this.game.promptWithMenu(this.controller, this, {
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

    giveBullets() {
        this.applyAbilityEffect(this.context.ability, ability => ({
            match: this,
            effect: ability.effects.modifyBullets(2)
        }));
        this.game.addMessage('{0} boots {1} to give {1} +2 bullets.', player, this.context.costs.boot, this);
    }
}

Skinwalker.code = '20015';

module.exports = Skinwalker;
