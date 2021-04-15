const DudeCard = require('../../dudecard.js');

class PostATron extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.game.onceConditional('onSetupDrawDeckShuffled', { condition: event => event.player === this.owner }, () => {
            if(this.location === 'play area') {
                this.owner.inventGadget(this);
            }
        });
    }
    setupCardAbilities(ability) {
        this.action({
            title: 'POST-A-TRON',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.isInTownSquare(),
            ifFailMessage: context => this.game.addMessage('{0} uses {1} but does not get any GR since {1} is not in Town Square ', context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to gain 3 GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(3);
            }
        });
    }
}

PostATron.code = '18018';

module.exports = PostATron;
