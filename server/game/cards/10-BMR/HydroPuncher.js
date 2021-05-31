const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class HydroPuncher extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent.getAttachmentsByKeywords(['weapon']).length === 2,
            effect: ability.effects.setAsStud()
        });
        this.whileAttached({
            effect: ability.effects.changeWeaponLimitFunction(() => {
                this.weaponCheck();
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
                                this.game.addMessage('{0} boots also {1} as result of {3}', player, this, card));
                            return true;
                        }
                    });
                }
            }
        });
    }

    weaponCheck() {
        let weapons = this.parent.getAttachmentsByKeywords(['weapon']);
        if(!weapons || weapons.length < 2) {
            return;
        }
        if(this.parent.hasKeyword('gadget') && weapons.length === 2) {
            return;
        }
        if(weapons[0].hasKeyword('melee') && weapons[1].hasKeyword('melee') && weapons.length === 2) {
            return;
        }
        this.discardOverLimit(weapons);
    }

    discardOverLimit(weapons) {
        this.game.promptForSelect(this.controller, {
            activePromptTitle: 'Select weapon to discard to meet the limit',
            waitingPromptTitle: 'Waiting for opponent to discard weapon over limit',
            cardCondition: card => weapons.includes(card),
            onSelect: (player, card) => {
                this.game.resolveGameAction(GameActions.discardCard({ card })).thenExecute(() => {
                    this.game.addMessage('{0} discards weapon {1} that is over the limit', player, card);
                    if(card !== this) {
                        this.weaponCheck();
                    }
                });
                return true;
            }
        });
    }
}

HydroPuncher.code = '18028';

module.exports = HydroPuncher;
