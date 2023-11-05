const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TurnTheOtherCheek extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Send dudes home',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude to send home',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: 'sendHome'
            },
            difficulty: context => context.target.getGrit(context),
            onSuccess: (context) => {
                const dudesSentHome = [];
                const dudesUnbooted = [];
                this.game.shootout.sendHome(context.target, context, { needToBoot: false }, () => dudesSentHome.push(context.target));
                this.game.shootout.sendHome(this.parent, context, { needToBoot: false }, () => dudesSentHome.push(this.parent));
                if(context.target.booted) {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                    dudesUnbooted.push(context.target);
                }
                if(this.parent.booted) {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: this.parent }), context);
                    dudesUnbooted.push(this.parent);
                }    
                this.game.queueSimpleStep(() => {
                    if(dudesSentHome.length) {
                        this.game.addMessage('{0} uses {1} to send {2} home', context.player, this, dudesSentHome);                    
                    }
                    if(dudesUnbooted.length) {
                        this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, dudesUnbooted);
                    }
                });                
            },
            source: this
        });
    }
}

TurnTheOtherCheek.code = '25045';

module.exports = TurnTheOtherCheek;
