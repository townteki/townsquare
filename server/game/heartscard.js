const AbilityDsl = require('./abilitydsl.js');
const DrawCard = require('./drawcard.js');

class HeartsCard extends DrawCard {
    constructor(owner, cardData, options = {}) {
        super(owner, cardData);
        this.traded = false;
        this.canTrade = true;
        this.resetHandler = () => this.reset();
        const fOptions = {
            useMeleeEffect: options.useMeleeEffect || false,
            providesBullets: options.providesBullets || false,
            providesStudBonus: options.providesStudBonus || false
        };

        if(fOptions.providesBullets && !this.bullets) {
            this.bullets = 0;
        }
        if(this.bullets || fOptions.providesBullets) {
            this.whileAttached({
                condition: () => (!fOptions.useMeleeEffect || !this.meleeWeaponCondition()) && !this.areBulletBonusesBlanked(),
                effect: AbilityDsl.effects.dynamicBullets(() => this.bullets),
                fromTrait: false
            });
        }
        if(this.influence) {
            this.whileAttached({
                condition: () => !this.areInfBonusesBlanked(),
                effect: AbilityDsl.effects.dynamicInfluence(() => this.influence),
                fromTrait: false
            });
        }
        if(fOptions.providesStudBonus) {
            this.whileAttached({
                condition: () => (!fOptions.useMeleeEffect || !this.meleeWeaponCondition()) && !this.areBulletBonusesBlanked(),
                effect: AbilityDsl.effects.setAsStud(),
                fromTrait: true
            });            
        }        
    }

    meleeWeaponCondition() {
        return this.game.shootout && this.game.shootout.getParticipants().some(dude => {
            if(dude.controller.equals(this.controller)) {
                return false;
            }
            let nonMeleeUnbootedWeapon = dude.attachments.filter(att => att.hasKeyword('weapon') && !att.hasKeyword('melee') && !att.booted);
            return nonMeleeUnbootedWeapon && nonMeleeUnbootedWeapon.length > 0;
        });
    }

    canBeTraded() {
        return this.canTrade;
    }

    wasTraded() {
        return this.traded;
    }

    entersPlay() {
        super.entersPlay();
        this.game.on('onRoundEnded', this.resetHandler);
    }

    leavesPlay() {
        super.leavesPlay();
        this.game.removeListener('onRoundEnded', this.resetHandler);
    }

    reset() {
        this.traded = false;
    }

    areBonusesBlanked() {
        return this.blanks.contains('bulletBonuses') && this.blanks.contains('infBonuses');
    }

    areBulletBonusesBlanked() {
        return this.blanks.contains('bulletBonuses');
    }

    areInfBonusesBlanked() {
        return this.blanks.contains('infBonuses');
    }

    isHex() {
        return this.hasKeyword('Hex');
    }

    isMiracle() {
        return this.hasKeyword('Miracle');
    }

    isSpirit() {
        return this.hasKeyword('Spirit') && !this.hasKeyword('Totem');
    }

    isTotem() {
        return this.hasKeyword('Totem');
    }
}

module.exports = HeartsCard;
