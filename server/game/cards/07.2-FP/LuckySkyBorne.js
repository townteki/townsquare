const DudeCard = require('../../dudecard.js');

class LuckySkyBorne extends DudeCard {
    entersPlay() {
        super.entersPlay();
        if(this.game.currentPhase === 'setup' && this.owner.hand.some(card => card.getType() === 'goods')) {
            this.game.promptForSelect(this.owner, {
                activePromptTitle: 'Select a goods',
                waitingPromptTitle: 'Waiting for opponent to select goods',
                cardCondition: card => card.location === 'hand',
                cardType: 'goods',
                autoSelect: true,
                onSelect: (player, card) => {
                    if(card.hasKeyword('gadget')) {
                        player.shuffleDrawDeck();
                        this.game.addMessage('{0} shuffles their deck because {1} is inventing {2}',
                            player, this, card);
                    }
                    player.attach(card, this, 'ability', () => true, this);
                    player.ghostrock -= card.cost;
                    return true;
                }
            });
        }
    }
}

LuckySkyBorne.code = '12007';

module.exports = LuckySkyBorne;
