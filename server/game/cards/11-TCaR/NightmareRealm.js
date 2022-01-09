const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NightmareRealm extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shootout: Nightmare Realm',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                ifAble: true
            },
            difficulty: 3,
            onSuccess: (context) => {
                if(context.target) {
                    this.untilEndOfShootoutRound(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.cannotLeaveShootout()
                    }));
                    this.game.addMessage('{0} uses {1} to prevent {2} from leaving this round and give them -1 bullets and -1 value each round', 
                        context.player, this, context.target);  
                    let eventHandler = event => {
                        if(this.game.shootout && event.player === this.game.shootout.leaderPlayer) {
                            this.applyAbilityEffect(context.ability, ability => ({
                                match: context.target,
                                effect: [
                                    ability.effects.modifyBullets(-1),
                                    ability.effects.modifyValue(-1)
                                ]
                            }));
                        }
                    };
                    this.game.on('onShooterToBePicked', eventHandler);
                    this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onShooterToBePicked', eventHandler));
                }
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select your dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.controller === this.controller &&
                        card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, dude) => {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: dude,
                            effect: ability.effects.modifyBullets(1)
                        }));
                        this.game.addMessage('{0} uses {1} to give {2} +1 bullets', 
                            player, this, dude);                    
                        return true;
                    },
                    source: this
                });            
            },
            source: this
        });
    }
}

NightmareRealm.code = '19033';

module.exports = NightmareRealm;
