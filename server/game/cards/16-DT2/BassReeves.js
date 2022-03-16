const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class BassReeves extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            location: 'any',
            targetController: 'current',
            condition: () => this.controller.getFaction() === Factions.LawDogs, 
            effect: ability.effects.reduceSelfCost('any', () => this.getNumOfWantedDudes())
        });

        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                if(context.player.modifyRank(1, context)) {
                    this.game.addMessage('{0}\'s rank is increased by 1 thanks to the {1}; Current rank is {2}', 
                        context.player, this, context.player.getTotalRank());
                }
            }
        });

        this.action({
            title: 'Bass Reeves',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude to callout',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    wanted: true,
                    condition: card => card.isNearby(this.gamelocation) 
                },
                cardType: ['dude']
            },
            ifCondition: () => !this.booted,
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but it does not have any effect because {1} is booted',
                    context.player, this),
            handler: context => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Boot or Call Out?',
                        buttons: [
                            { 
                                text: 'Boot', 
                                method: 'bassBoot',
                                disabled: !this.abilityContext.target.allowGameAction('boot')
                            },
                            { 
                                text: 'Call Out', 
                                method: 'bassCallout',
                                disabled: !this.abilityContext.target.allowGameAction('callout')
                            }
                        ]
                    },
                    source: this
                });
            }
        });
    }

    bassBoot(player) {
        this.game.resolveGameAction(GameActions.bootCard({ card: this.abilityContext.target }), this.abilityContext).thenExecute(() => {
            this.game.addMessage('{0} uses {1} to boot {2}', player, this, this.abilityContext.target);
        });
        return true;
    }

    bassCallout(player) {
        this.lastingEffect(this.abilityContext.ability, ability => ({
            until: {
                onDudeAcceptedCallOut: () => true,
                onCardCallOutFinished: () => true
            },
            match: this,
            effect: ability.effects.canCallOutAdjacent()
        }));

        let eventHandler = event => {
            this.game.resolveGameAction(GameActions.moveDude({
                card: event.caller,
                targetUuid: event.callee.gamelocation,
                options: { needToBoot: true }
            }), this.abilityContext).thenExecute(() => {
                this.game.addMessage('{0} moves {1} to {2}\'s location because they accepted the callout',
                    this.abilityContext.player, event.caller, event.callee);                        
            });
        };
        this.game.once('onDudeAcceptedCallOut', eventHandler);
        this.game.once('onCardCallOutFinished', () => {
            this.game.removeListener('onDudeAcceptedCallOut', eventHandler);
        });
        this.game.resolveGameAction(GameActions.callOut({ 
            caller: this, 
            callee: this.abilityContext.target 
        }), this.abilityContext).thenExecute(() => {
            this.game.addMessage('{0} uses {1} to call out {2}', player, this, this.abilityContext.target);
        });
        return true;
    }

    getNumOfWantedDudes() {
        return this.controller.getOpponent().cardsInPlay.reduce((num, card) => {
            if(card.getType() === 'dude' && card.isWanted()) {
                return num + 1;
            }
            return num;
        }, 0);
    }
}

BassReeves.code = '24077';

module.exports = BassReeves;
