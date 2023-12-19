const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Disarm extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Disarm',
            playType: ['cheatin resolution'],
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                if(context.target.hasAttachment()) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select attachment',
                        waitingPromptTitle: 'Waiting for opponent to select attachment',
                        cardCondition: card => card.parent === context.target,
                        onSelect: (player, att) => {
                            if(this.game.shootout) {
                                if(att.isUnique()) {
                                    this.game.resolveGameAction(GameActions.discardCard({ card: att }), context).thenExecute(() => {
                                        this.game.addMessage('{0} uses {1} to discard {2}\'s attachment {3}', 
                                            context.player, this, context.target, att);
                                    });
                                } else {
                                    this.game.resolveGameAction(GameActions.aceCard({ card: att }), context).thenExecute(() => {
                                        this.game.addMessage('{0} uses {1} to ace {2}\'s attachment {3}', 
                                            context.player, this, context.target, att);
                                    });                                
                                }
                                this.game.resolveGameAction(GameActions.decreaseCasualties({ player: context.player }), context);
                            } else {
                                this.game.resolveGameAction(GameActions.bootCard({ card: att }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} to boot {2}\'s attachment {3}', 
                                        context.player, this, context.target, att);
                                });
                            }
                            return true;
                        },
                        source: this
                    });
                }
                this.game.queueSimpleStep(() => { 
                    if(this.game.shootout) {
                        this.game.resolveGameAction(GameActions.decreaseCasualties({ player: context.player }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to ignore all casualties this round', context.player, this);
                        });
                    }
                    if(!context.player.isCheatin()) {
                        context.ability.selectAnotherTarget(context.player, context, {
                            activePromptTitle: 'Select your dude',
                            waitingPromptTitle: 'Waiting for opponent to select dude',
                            cardCondition: card => card.location === 'play area' &&
                                card.controller === context.player,
                            cardType: 'dude',
                            onSelect: (player, dude) => {
                                this.untilEndOfRound(context.ability, ability => ({
                                    match: dude,
                                    effect: [
                                        ability.effects.modifyBullets(2),
                                        ability.effects.setAsStud()
                                    ]
                                }));
                                this.game.addMessage('{0} uses {1} to give {2} +2 bullets and make them a stud', 
                                    context.player, this, dude);
                                return true;
                            },
                            source: this
                        });
                    }
                });
            }
        });
    }
}

Disarm.code = '19039';

module.exports = Disarm;
