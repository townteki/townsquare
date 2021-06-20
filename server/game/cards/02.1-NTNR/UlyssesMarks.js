const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class UlyssesMarks extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.location === 'play area' && this.locationCard.hasKeyword('Saloon'),
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyControl(1)
        });
        this.action({
            title: 'Ulysses Marks',
            playType: 'noon',     
            ifCondition: () => this.locationCard.hasKeyword('Saloon'),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1} but fails because he is not in Saloon', context.player, this),
            target: {
                activePromptTitle: 'Select a dude to kick out of the saloon',
                ifAble: true,
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card !== this && this.isInSameLocation(card) 
                },
                cardType: ['dude'],
                autoSelect: true,
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.target, 
                    targetUuid: this.game.townsquare.uuid, 
                    options: { needToBoot: true, allowBooted: true } 
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to kick {2} out of the {3}', 
                        context.player, this, context.target, this.locationCard);
                });
            }
        });
    }
}

UlyssesMarks.code = '02007';

module.exports = UlyssesMarks;
