const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BlueLightnin extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, { providesStudBonus: true });
    }

    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Blue Lightin\'',
            playType: ['shootout'],
            repeatable: true,
            cost: ability.costs.boot(card => card.parent === this.parent &&
                card.hasKeyword('hex')),
            message: context => this.game.addMessage('{0} uses {1} and boots {2} to give +1', context.player, this),
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: `Choose bonus for ${this.parent.title}`,
                        buttons: [
                            { text: '+1 Huckster skill', method: 'giveBonus', arg: 'hucksterBonus' },
                            { text: '+1 bullet', method: 'giveBonus', arg: 'bulletBonus' }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    giveBonus(player, arg) {
        if(arg === 'hucksterBonus') {
            this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                match: this.parent,
                effect: ability.effects.modifySkillRating('huckster', 1)
            }));
            this.game.addMessage('{0} uses {1} and boots {2} to give {3} +1 Huckster skill rating', 
                player, this, this.abilityContext.costs.boot, this.parent);
        } else if(arg === 'bulletBonus') {
            this.applyAbilityEffect(this.abilityContext.ability, ability => ({
                match: this.parent,
                effect: ability.effects.modifyBullets(1)
            }));
            this.game.addMessage('{0} uses {1} and boots {2} to give {3} +1 bullets',
                player, this, this.abilityContext.costs.boot, this.parent);
        }
        return true;        
    }
}

BlueLightnin.code = '22038';

module.exports = BlueLightnin;
