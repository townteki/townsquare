const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class RecruitmentDrive extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Recruitment Drive',
            playType: 'noon',
            target: 'townsquare',
            message: context =>
                this.game.addMessage('{0} plays {1} marking {2}.', context.player, this, context.target),
            onSuccess: (context) => {
                this.game.resolveGameAction(
                    GameActions.search(
                        {
                            title: 'Select a dude or deed to put into play',
                            location: 'discard pile',
                            match: { condition: card => card.getType() === 'dude' || card.getType() === 'deed' },
                            player: context.leader.owner,
                            numToSelect: 1,
                            cancelMessage:(context) =>
                                this.game.addMessage('{0} searches their discard pile and found nothing', context.leader.owner, this),
                            handler: (card) => {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(5), context.leader.owner, card);
                                this.game.addMessage('{0} searches their discard pile and found {1}.', context.leader.owner, card);
                            }
                        }), context
                );                
            }
        });
    }
}

RecruitmentDrive.code = '01133';

module.exports = RecruitmentDrive;
