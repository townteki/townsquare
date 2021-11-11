const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class Skinwalker extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Skinwalker',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.getType() === 'dude' &&
                card.hasKeyword('abomination') &&
                card.isParticipating()
            ),
            handler: context => {
                this.abilityContext = context;
                this.bootableAttachments = this.game.shootout.getPosseByPlayer(this.controller.getOpponent()).getAttachments(card => !card.booted);
                if(this.bootableAttachments.length) {
                    this.game.promptWithMenu(context.player, this, {
                        activePrompt: {
                            menuTitle: 'Choose one',
                            buttons: [
                                { text: 'Boot attachment', method: 'bootAttachment' },
                                { text: 'Give +2 bullets', method: 'giveBullets' }
                            ]
                        },
                        source: this
                    });
                } else {
                    this.giveBullets(context.player);
                }
            }
        });
    }

    bootAttachment(player) {
        this.abilityContext.ability.selectAnotherTarget(player, this.abilityContext, {
            activePromptTitle: 'Select an attachment to boot',
            cardCondition: card => this.bootableAttachments.includes(card),
            gameAction: 'boot',
            onSelect: (player, attachment) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: attachment }), this.abilityContext.context);
                this.game.addMessage('{0} uses {1} and boots {2} to boot {3}', player, this, this.abilityContext.costs.boot, attachment);
                return true;
            },
            source: this
        });
        return true;
    }

    giveBullets(player) {
        this.applyAbilityEffect(this.abilityContext.ability, ability => ({
            match: this,
            effect: ability.effects.modifyBullets(2)
        }));
        this.game.addMessage('{0} uses {1} and boots {2} to give {3} +2 bullets', player, this, this.abilityContext.costs.boot, this);
        return true;
    }
}

Skinwalker.code = '20015';

module.exports = Skinwalker;
