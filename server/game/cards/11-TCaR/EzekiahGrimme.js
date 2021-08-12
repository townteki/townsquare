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
                onPullSuccess: event => event.source.isSpell() &&
                    event.pullingDude.controller === this.controller &&
                    event.source.parent === event.pullingDude &&
                    event.pulledCard.isSpell()
            },
            cost: [ability.costs.bootSelf()],
            handler: context => {
                // set to null to prevent discarding of pulled card in abilityresolver
                context.event.context.pull = null;
                this.game.promptForYesNo(context.player, {
                    title: 'Do you want to attach pulled Spell?',
                    onYes: player => {
                        this.game.addMessage('{0} uses {1} to attach pulled card {2} booted to {3}', 
                            player, this, context.event.pulledCard, context.event.pullingDude),
                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                            playType: 'ability',
                            abilitySourceType: 'ability',
                            targetParent: context.event.pullingDude,
                            booted: true
                        }), player, context.event.pulledCard);
                    },
                    onNo: player => {
                        player.handlePulledCard(context.event.pulledCard);
                    }
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
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                const topCards = context.player.drawDeck.slice(0, 5);
                this.game.addMessage('{0} uses {1} to reveal top 5 cards of their deck: {2}', 
                    context.player, this, topCards);
                const possibleSpells = topCards.filter(revealedCard => {
                    if(!revealedCard.isSpell()) {
                        return false;
                    }
                    const copies = this.getNumOfCopiesInPlay(revealedCard, context.player);
                    if(copies < 2) {
                        return true;
                    }
                    return false;
                });
                const revealFunc = card => topCards.includes(card);
                this.game.cardVisibility.addRule(revealFunc);
                if(possibleSpells.length > 0) {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a spell to attach',
                        waitingPromptTitle: 'Waiting for opponent to select dude',
                        cardCondition: card => possibleSpells.includes(card) &&
                            card.canAttach(context.player, context.costs.boot),
                        cardType: 'spell',
                        onSelect: (player, spell) => {
                            this.game.addMessage('{0} uses {1} to attach {2} from revealed cards to {3} paying all costs', 
                                context.player, this, spell, context.costs.boot);
                            this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                playType: 'ability',
                                abilitySourceType: 'ability',
                                targetParent: context.costs.boot
                            }), player, spell);                        
                            return true;
                        }
                    });
                }
                this.game.queueSimpleStep(() => {
                    this.game.cardVisibility.removeRule(revealFunc);
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
