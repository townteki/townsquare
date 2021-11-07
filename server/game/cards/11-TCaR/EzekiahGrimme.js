const GameActions = require('../../GameActions/index.js');
const LegendCard = require('../../legendcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class EzekiahGrimme extends LegendCard {
    setupCardAbilities(ability) {       
        this.persistentEffect({
            targetController: 'current',
            condition: () => true,
            effect: [
                ability.effects.increaseCost({
                    playingTypes: ['shoppin', 'ability'],
                    amount: card => this.getNumOfCopiesInPlay(card),
                    match: card => card.getType() === 'spell'               
                })
            ]
        });
        
        this.reaction({
            title: 'React: Attach pulled spell',
            when: {
                onPullSuccess: event => event.source && event.source.isSpell() &&
                    event.pullingDude.controller === this.controller &&
                    event.source.parent === event.pullingDude &&
                    event.pulledCard.isSpell()
            },
            cost: [ability.costs.bootSelf()],
            handler: context => {
                context.event.context.pull.doNotHandlePulledCard = true;
                this.game.promptForYesNo(context.player, {
                    title: 'Do you want to attach pulled Spell?',
                    onYes: player => {
                        this.game.addMessage('{0} uses {1} to attach pulled card {2} booted to {3}', 
                            player, this, context.event.pulledCard, context.event.pullingDude),
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playType: 'ability',
                            abilitySourceType: 'card',
                            targetParent: context.event.pullingDude,
                            booted: true
                        }), player, context.event.pulledCard);
                    },
                    onNo: player => {
                        player.handlePulledCard(context.event.pulledCard);
                    },
                    source: this
                });
            }
        });

        this.action({
            title: 'Noon: Reveal top 5 cards',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card =>
                    card.getType() === 'dude' &&
                    card.isSkilled()
                )
            ],
            handler: context => {
                this.game.resolveGameAction(GameActions.revealTopCards({
                    player: context.player,
                    amount: 5,
                    properties: {
                        activePromptTitle: 'Select a spell to attach',
                        selectCondition: revealedCard => {
                            if(!revealedCard.isSpell()) {
                                return false;
                            }
                            const copies = this.getNumOfCopiesInPlay(revealedCard, context.player);
                            if(copies < 2) {
                                return revealedCard.canAttach(context.player, context.costs.boot);
                            }
                            return false;
                        },
                        onSelect: (player, spells) => {
                            this.game.addMessage('{0} uses {1} to attach {2} from revealed cards to {3} paying all costs', 
                                context.player, this, spells[0], context.costs.boot);
                            this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                playType: 'ability',
                                abilitySourceType: 'card',
                                targetParent: context.costs.boot
                            }), player, spells[0]);  
                        }
                    }
                }), context).thenExecute(() => {
                    context.player.shuffleDrawDeck();
                });
            }
        });
    }

    getNumOfCopiesInPlay(spell, player) {
        let players = this.game.getPlayers();
        if(player) {
            players = [player];
        }
        return players.reduce((totalAmount, player) => {
            return totalAmount += player.cardsInPlay.reduce((amount, card) => {
                if(card.title === spell.title) {
                    return amount + 1;
                }
                return amount;
            }, 0);
        }, 0);
    }
}

EzekiahGrimme.code = '19002';

module.exports = EzekiahGrimme;
