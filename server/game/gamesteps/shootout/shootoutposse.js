const ShootoutStatuses = require('../../Constants/ShootoutStatuses');
/** @typedef {import('../../dudecard')} DudeCard */

class ShootoutPosse {
    constructor(shootout, player, isLeading) {
        this.shootout = shootout;
        this.player = player;
        this.posse = [];
        this.shooter = null;
        this.studBonus = 0;
        this.drawBonus = 0;
        this.shooterBonus = 0;
        this.isLeading = isLeading;
    }

    isInPosse(card) {
        if(card.getType() === 'dude') {
            return this.posse.includes(card.uuid);
        }
        if(card.getType() === 'goods' || card.getType() === 'spell') {
            return this.posse.some(dudeUuid => {
                let dude = this.player.findCardInPlayByUuid(dudeUuid);
                return dude && dude.hasAttachment(attachment => attachment.uuid === card.uuid);
            });
        }
        return false;
    }

    isEmpty() {
        return this.posse.length === 0;
    }

    addToPosse(dude) {
        this.posse.push(dude.uuid);
        if(this.isLeading) {
            dude.shootoutStatus = ShootoutStatuses.LeaderPosse;
        } else {
            dude.shootoutStatus = ShootoutStatuses.MarkPosse;
        }      
    }

    removeFromPosse(dude) {
        this.posse = this.posse.filter(posseDudeUuid => posseDudeUuid !== dude.uuid);
        dude.shootoutStatus = ShootoutStatuses.None;
    }

    findShooter(stud = true) {
        let dudes = this.getDudes();
        if(dudes.length === 0) {
            return 0;
        }
        const possibleShooters = [];
        const otherDudes = [];
        const otherTypeDudes = [];
        dudes.forEach(dude => {
            let rating = this.shootout.useInfluence ? dude.influence : dude.bullets;
            if((dude.isStud() && stud) || (dude.isDraw() && !stud)) {
                if(rating > 0) {
                    possibleShooters.push(dude);
                } else {
                    otherDudes.push(dude);
                }
            } else {
                otherTypeDudes.push(dude);
            }
        });
        if(possibleShooters.length > 0) {
            return possibleShooters.reduce((shooter, dude) => {
                if(!shooter) {
                    return dude;
                }
                let rating = this.shootout.useInfluence ? dude.influence : dude.bullets;
                let shooterRating = this.shootout.useInfluence ? shooter.influence : shooter.bullets;
                return rating > shooterRating ? dude : shooter;
            });
        }
        if(otherDudes.length > 0) {
            if(dudes.length === otherDudes.length) {
                return otherDudes[0];
            }
            return otherTypeDudes[0];
        }
    }

    getStudBonus(checkSwitched = true) {
        if(checkSwitched && this.player.bulletBonusesAreSwitched()) {
            return this.getDrawBonus(false);
        }
        let shooterBonus = 0;
        let tempShooter = this.shooter;
        if(!tempShooter) {
            tempShooter = this.findShooter();
            if(!tempShooter) {
                return 0;
            }
        }
        if(tempShooter.isStud() && !tempShooter.doesNotProvideBulletRatings()) {
            shooterBonus = this.shootout.useInfluence ? tempShooter.influence : tempShooter.bullets;
        }
        if(this.player.onlyShooterContributes()) {
            return shooterBonus;
        }

        let baseBonus = this.studBonus + shooterBonus;
        return this.posse.reduce((bonus, dudeUuid) => {
            let dude = this.player.findCardInPlayByUuid(dudeUuid);
            if(dude && dude.isStud() && !dude.doesNotProvideBulletRatings()) {
                // if dude is shooter, bonus was already counted
                return bonus += dude !== tempShooter ? 1 : 0;
            }
            return bonus;
        }, baseBonus);
    }

    getDrawBonus(checkSwitched = true) {
        if(checkSwitched && this.player.bulletBonusesAreSwitched()) {
            return this.getStudBonus(false);
        }
        let shooterBonus = 0;
        let tempShooter = this.shooter;
        if(!tempShooter) {
            tempShooter = this.findShooter(false);
            if(!tempShooter) {
                return 0;
            }
        }
        if(tempShooter.isDraw() && !tempShooter.doesNotProvideBulletRatings()) {
            shooterBonus = this.shootout.useInfluence ? tempShooter.influence : tempShooter.bullets;
        }
        if(this.player.onlyShooterContributes()) {
            return shooterBonus;
        }

        let baseBonus = this.drawBonus + shooterBonus;
        return this.posse.reduce((bonus, dudeUuid) => {
            let dude = this.player.findCardInPlayByUuid(dudeUuid);
            if(dude && dude.isDraw() && !dude.doesNotProvideBulletRatings()) {
                // if dude is shooter, bonus was already counted
                return bonus += dude !== tempShooter ? 1 : 0;
            }
            return bonus;
        }, baseBonus);
    }

    pickShooter(shooter) {
        this.shooter = shooter;
        if(this.isLeading) {
            shooter.shootoutStatus = ShootoutStatuses.LeaderShooter;
        } else {
            shooter.shootoutStatus = ShootoutStatuses.MarkShooter;
        }
        this.shooter.lastingEffect(null, ability => ({
            until: {
                onShootoutRoundFinished: () => true
            },
            match: this.shooter,
            effect: ability.effects.dynamicBullets(() => this.shooterBonus)
        }));
    }

    getTotalStat(stat) {
        return this.getDudes().reduce((memo, dude) => memo + dude.getStat(stat), 0);
    }

    actOnPosse(action, exception = () => false) {
        this.posse.map(dudeUuid => this.player.findCardInPlayByUuid(dudeUuid)).filter(dude => dude && !exception(dude)).forEach(dude => action(dude));
    }
    
    /**
     * Returns dudes in the posse matching the `condition`.
     *
     * @param {(dude: DudeCard) => boolean} condition - condition that the dude should match.
     * @returns {Array.<DudeCard>} - array of dudes matching condition.
     */    
    getDudes(condition = () => true) {
        return this.posse.map(dudeUuid => this.player.findCardInPlayByUuid(dudeUuid)).filter(card => card && condition(card));
    }

    /**
     * Returns attachments on dudes in the posse matching the `condition`.
     *
     * @param {(dude: DrawCard) => boolean} condition - condition that the attachment should match.
     * @returns {Array.<DrawCard>} - array of attachments matching condition.
     */
    getAttachments(condition = () => true) {
        const attachments = this.getDudes().map(dude => dude.attachments);
        return [].concat(...attachments).filter(card => card && condition(card));
    }

    /**
     * Returns cards in the posse matching the `condition`.
     *
     * @param {(card: DrawCard) => boolean} condition - condition that the card should match.
     * @returns {Array.<DrawCard>} - array of cards matching condition.
     */
    getCards(condition = () => true) {
        return this.getDudes().reduce((result, dude) => {
            result = result.concat(dude.attachments.filter(att => condition(att)));
            if(condition(dude)) {
                result.push(dude);
            }
            return result;
        }, []);
    }

    /**
     * Returns true if there is dude matching the `predicate`.
     *
     * @param {(dude: DudeCard) => boolean} predicate - predicate that the dude should match.
     * @returns {boolean} - true if there is dude matchinf the `predicate`, false otherwise.
     */       
    findInPosse(predicate = () => true) {
        return this.posse.map(dudeUuid => this.player.findCardInPlayByUuid(dudeUuid)).find(card => card && predicate(card));
    }

    resetForTheRound() {
        if(this.shooter && this.shooter.isParticipating()) {
            this.shooter.shootoutStatus = ShootoutStatuses.LeaderPosse;
            this.shooter = null;
        }        
    }
}

module.exports = ShootoutPosse;
