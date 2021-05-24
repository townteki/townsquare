const ShootoutStatuses = require('../../Constants/ShootoutStatuses');

class ShootoutPosse {
    constructor(shootout, player, isLeading) {
        this.shootout = shootout;
        this.player = player;
        this.posse = [];
        this.shooter = null;
        this.studBonus = 0;
        this.drawBonus = 0;
        this.isLeading = isLeading;
    }

    isInPosse(card) {
        if(card.getType() === 'dude') {
            return this.posse.includes(card.uuid);
        }
        if(card.getType() === 'goods' || card.getType() === 'spell') {
            return this.posse.some(dudeUuid => {
                let dude = this.player.findCardInPlayByUuid(dudeUuid);
                return dude.hasAttachment(attachment => attachment.uuid === card.uuid);
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

    getStudBonus(onlyShooter = false) {
        let shooterRating = this.shootout.useInfluence ? this.shooter.influence : this.shooter.bullets;
        if(onlyShooter) {
            return this.shooter.isStud() && !this.shooter.doesNotProvideBulletRatings() ? shooterRating : 0;
        }

        let bonus = this.studBonus;
        this.posse.forEach(dudeUuid => {
            let dude = this.player.findCardInPlayByUuid(dudeUuid);
            let dudeRating = this.shootout.useInfluence ? dude.influence : dude.bullets;
            if(dude.isStud() && !dude.doesNotProvideBulletRatings()) {
                bonus += dude === this.shooter ? dudeRating : 1;
            }   
        });

        return bonus;
    }

    getDrawBonus(onlyShooter = false) {
        let shooterRating = this.shootout.useInfluence ? this.shooter.influence : this.shooter.bullets;
        if(onlyShooter) {
            return this.shooter.isDraw() && !this.shooter.doesNotProvideBulletRatings() ? shooterRating : 0;
        }

        let bonus = this.drawBonus;
        this.posse.forEach(dudeUuid => {
            let dude = this.player.findCardInPlayByUuid(dudeUuid);
            let dudeRating = this.shootout.useInfluence ? dude.influence : dude.bullets;
            if(dude.isDraw() && !this.shooter.doesNotProvideBulletRatings()) {
                bonus += dude === this.shooter ? dudeRating : 1;
            }   
        });

        return bonus;
    }

    pickShooter(shooter) {
        this.shooter = shooter;
        if(this.isLeading) {
            shooter.shootoutStatus = ShootoutStatuses.LeaderShooter;
        } else {
            shooter.shootoutStatus = ShootoutStatuses.MarkShooter;
        }
    }

    actOnPosse(action, exception = () => false) {
        this.posse.map(dudeUuid => this.player.findCardInPlayByUuid(dudeUuid)).filter(dude => dude && !exception(dude)).forEach(dude => action(dude));
    }
    
    getDudes(condition = () => true) {
        return this.posse.map(dudeUuid => this.player.findCardInPlayByUuid(dudeUuid)).filter(card => card && condition(card));
    }

    findInPosse(predicate = () => true) {
        return this.posse.map(dudeUuid => this.player.findCardInPlayByUuid(dudeUuid)).find(card => card && predicate(card));
    }
}

module.exports = ShootoutPosse;
