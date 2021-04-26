const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class HydroPuncher extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent.getAttachmentsByKeywords(['weapon']).length === 2,
            effect: ability.effects.setAsStud()
        });
        this.whileAttached({
            effect: ability.effects.canAttachWeapon(weapon => {
                let weapons = this.getAttachmentsByKeywords(['weapon']);
                if(weapons && weapons.length >= 2) {
                    return false;
                }
                if(!weapons || weapons.length === 0) {
                    return true;
                }
                if(this.parent.hasKeyword('gadget')) {
                    return true;
                }
                return weapons[0].hasKeyword('melee') && weapon.hasKeyword('melee');
            })
        });
        this.action({
            title: 'Hydro-Puncher',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to punch {2} and boot them', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                if(context.target.hasAttachment()) {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Choose an attachment',
                        waitingPromptTitle: 'Waiting for opponent to choose an attachment',
                        cardCondition: card => card.parent === context.target,
                        cardType: ['goods', 'spell'],
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.bootCard({ card: card }), context).thenExecute(() =>
                                this.game.addMessage('{0} boots also {1} as result of {3}', context.player, this, card));
                            return true;
                        }
                    });
                }
            }
        });
    }
}

HydroPuncher.code = '18028';

module.exports = HydroPuncher;
