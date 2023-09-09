const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class KevinWainwrightExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon/Shootout: Kevin Wainwright (Exp.1)',
            playType: ['noon', 'shootout:join'],
            target: {
                activePromptTitle: 'Select location for Kevin to move to',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.uuid !== this.gamelocation &&
                        (!this.game.shootout || (this.game.shootout.shootoutLocation && this.game.shootout.shootoutLocation.uuid === card.uuid)) &&
                        this.game.getDudesAtLocation(card.uuid,
                            dude => dude.hasOneOfKeywords(['abomination', 'huckster'])).length
                },
                cardType: ['location']
            },
            actionContext: { card: this, gameAction: () => {
                if(this.game.shootout) {
                    const actionArray = ['joinPosse'];
                    if(this.isInShootoutLocation()) {
                        actionArray.unshift('moveDude');
                    }
                    return actionArray;
                }
                return 'moveDude';
            } },    
            handler: context => {
                let action;
                let actionText = '{0} uses {1} to move him to ';
                if(this.game.shootout) {
                    action = GameActions.joinPosse({ card: this });
                    actionText += 'posse';
                } else {
                    action = GameActions.moveDude({ 
                        card: this, 
                        targetUuid: context.target.gamelocation
                    });
                    actionText += '{2}';
                }
                this.game.resolveGameAction(action, context).thenExecute(() => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setAsStud()
                    }));
                    this.game.addMessage(actionText + ' and make him a stud', context.player, this, this.locationCard);
                    if(this.game.getNumberOfPlayers() > 1 && 
                        context.player.getOpponent().getDudesAtLocation(this.gamelocation, dude => dude.getGrit(context) >= 11).length) {
                        context.player.drawCardsToHand(2, context);
                        this.game.addMessage('{0} uses {1} to draw 2 cards', context.player, this);
                    }
                });
            }
        });
    }
}

KevinWainwrightExp1.code = '20017';

module.exports = KevinWainwrightExp1;
