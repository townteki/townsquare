const ActionCard = require('../../actioncard.js');

class ReadyFerAnythin extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Ready Fer Anythin\'',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            },
            handler: context => {
                let suffix = '';
                if(context.target.hasSidekick()) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.modifyInfluence(1)
                    }));
                    suffix += ' and gives them +1 influence';
                }
                if(context.target.hasWeapon()) {
                    context.player.drawCardsToHand(1, context);
                    suffix += (suffix ? ' and ' : ', ') + 'draws a card';
                }
                if(context.target.hasAttire()) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.setAsStud()
                    }));
                    suffix += (suffix ? ' and ' : ', ') + 'makes them a stud';
                }
                if(context.target.hasHorse()) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.modifyBullets(1)
                    }));
                    suffix += (suffix ? ' and ' : ', ') + 'gives them +1 bullets';
                }
                this.game.addMessage('{0} uses {1} to prepare {2}' + suffix, context.player, this, context.target);
            }
        });
    }
}

ReadyFerAnythin.code = '25053';

module.exports = ReadyFerAnythin;
