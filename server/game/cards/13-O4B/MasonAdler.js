const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class MasonAdler extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards(this, attachment => 
                attachment.hasKeyword('weapon') && !attachment.hasKeyword('melee'))
        });

        this.job({
            title: 'Job: Ace Mark',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Mark an opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: (card, context) => card.getGrit(context) >= 11 
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPossesGathered: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.controller,
                    effect: ability.effects.otherDudesCannotJoin()
                }));
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.game.shootout,
                    effect: ability.effects.cannotBringDudesIntoPosseByShootout()
                }));
            },
            onSuccess: (job, context) => {
                if(job.mark.location === 'play area') {
                    this.game.resolveGameAction(GameActions.aceCard({ card: job.mark }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to ace {2}', context.player, this, job.mark);
                    });
                }
            }
        });

        this.action({
            title: 'Shootout: Become Abomination',
            playType: ['shootout'],
            repeatable: true,
            condition: () => !this.actionUsed,
            ifCondition: context => {
                const oppCards = this.controller.getOpponent().cardsInPlay;
                let highestGrit = 0;
                const highestGritDudes = oppCards.reduce((result, card) => {
                    if(card.getType() === 'dude') {
                        const dudeGrit = card.getGrit(context);
                        if(dudeGrit > highestGrit) {
                            highestGrit = dudeGrit;
                            result = [card];
                        } else if(dudeGrit === highestGrit) {
                            result.push(card);
                        }
                    }
                    return result;
                }, []);
                return highestGritDudes.some(dude => dude.isParticipating());
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but opposing dude with the highest grit is not in the opposing posse', 
                    context.player, this),
            message: context => 
                this.game.addMessage('{0} uses {1} to gain Abomination keyword and become a stud', context.player, this),
            handler: context => {
                this.actionUsed = true;
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.addKeyword('abomination')
                    ]
                }));
                this.game.once('onShootoutPhaseFinished', () => this.actionUsed = false);
            }
        });
    }
}

MasonAdler.code = '21022';

module.exports = MasonAdler;
