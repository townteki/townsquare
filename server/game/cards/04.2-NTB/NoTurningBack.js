const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class NoTurningBack extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Noon: Ace dude to gain GR',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude to ace',
                cardCondition: { location: 'play area', controller: 'current', condition: card => card.owner === this.controller },
                cardType: ['dude'],
                gameAction: 'ace'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and aces {2} to gain GR equal to {2}\'s cost ({3})', context.player, this, context.target, context.target.cost),
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context).thenExecute(() => {
                    context.player.modifyGhostRock(context.target.cost);
                });
            }
        });

        this.action({
            title: 'Resolution: Ace dude to reduce casualties',
            playType: ['resolution'],
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Choose a dude to ace',
                    waitingPromptTitle: 'Waiting for opponent to choose a dude',
                    cardCondition: card => card.location === 'play area' && card.controller === context.player && card.owner === context.player,
                    cardType: 'dude',
                    gameAction: 'ace',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.aceCard({ card }), context).thenExecute(() => {
                            player.modifyCasualties(-999);
                            this.game.addMessage('{0} uses {1} and aces {2} to reduce casualties to 0', player, this, card);
                        });           
                        return true;
                    },
                    source: this
                });
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Choose a dude to get bonus',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: card,
                            effect: [
                                ability.effects.modifyBullets(2),
                                ability.effects.setAsStud()
                            ]
                        }));
                        this.game.addMessage('{0} uses {1} to make {2} a stud and give them +2 bullets', player, this, card);
                        return true;
                    },
                    source: this
                });
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: context.player,
                    effect: ability.effects.dudesCannotFlee()
                }));       
                this.game.addMessage('{0}\'s dudes cannot flee this round because of {1}', context.player, this);
            }
        });
    }
}

NoTurningBack.code = '07021';

module.exports = NoTurningBack;
