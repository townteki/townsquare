const DudeCard = require('../../dudecard.js');

class JohnAcesRadcliffe extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards(this, attachment => attachment.hasKeyword('weapon'))
        });

        this.traitReaction({
            when: {
                onCardAbilityResolved: event => this.isParticipating() && 
                    event.ability.playTypePlayed() === 'shootout',
                onPassAction: event => this.isParticipating() &&
                    event.playWindow.name === 'shootout plays'
            },
            handler: context => {
                if(this.game.getNumberOfPlayers() <= 1) {
                    return;
                }
                if(context.player.hand.length > context.player.getOpponent().hand.length) {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutPhaseFinished: () => true
                        },
                        condition: () => this.isParticipating(),
                        match: card => card === this,
                        effect: ability.effects.setAsStud()
                    }));
                } else {
                    this.lastingEffect(context.ability, ability => ({
                        until: {
                            onShootoutPhaseFinished: () => true
                        },
                        condition: () => this.isParticipating(),
                        match: card => card === this,
                        effect: ability.effects.setAsDraw()
                    }));
                }
            }
        });
    }
}

JohnAcesRadcliffe.code = '08007';

module.exports = JohnAcesRadcliffe;
