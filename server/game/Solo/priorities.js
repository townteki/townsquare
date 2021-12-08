function booleanCondition(bool1, bool2) {
    if((!bool1 && !bool2) || (bool1 && bool2)) {
        return 0;
    }
    return bool1 ? -1 : 1;
}

const Priorities = {
    lowestInfluence: function() {
        return (dude1, dude2) => dude1.getSundownInfluence() - dude2.getSundownInfluence();
    },
    highestInfluence: function() {
        return (dude1, dude2) => dude2.getSundownInfluence() - dude1.getSundownInfluence();
    },
    highestBullets: function() {
        return (dude1, dude2) => dude2.bullets - dude1.bullets;
    },
    highestControl: function() {
        return (card1, card2) => card2.control - card1.control;
    },
    highestProduction: function() {
        return (card1, card2) => card2.production - card1.production;
    },
    highestCost: function() {
        return (card1, card2) => card2.cost - card1.cost;
    },
    highestStud: function(condition = () => true) {
        return (dude1, dude2) => {
            if(dude1.isStud() && condition(dude1)) {
                if(dude2.isStud() && condition(dude2)) {
                    return dude1.bullets - dude2.bullets;
                }
                return -1;
            }
            return dude2.isStud() && condition(dude2) ? 1 : 0;
        };
    },
    stud: function() {
        return (dude1, dude2) => booleanCondition(dude1.isStud(), dude2.isStud());
    },
    draw: function(afterShootout = false) {
        return (dude1, dude2) => {
            let isDraw1 = afterShootout ? dude1.isDrawAfterShootout() : dude1.isDraw();
            let isDraw2 = afterShootout ? dude2.isDrawAfterShootout() : dude2.isDraw();
            return booleanCondition(isDraw1, isDraw2);
        };
    },
    unbootedCard: function() {
        return (card1, card2) => booleanCondition(!card1.booted, !card2.booted);
    },
    mostAttachments: function() {
        return (card1, card2) => {
            const numAtt1 = card1.attachments.filter(att => !att.hasKeyword('condition')).length;
            const numAtt2 = card2.attachments.filter(att => !att.hasKeyword('condition')).length;
            return numAtt2 - numAtt1;
        };
    },
    lowestCombinedCost: function() {
        return (card1, card2) => {
            const combinedCost1 = [card1].concat(card1.attachments)
                .reduce((cost, card) => cost + card.cost, 0);
            const combinedCost2 = [card2].concat(card2.attachments)
                .reduce((cost, card) => cost + card.cost, 0);
            return combinedCost1 - combinedCost2;
        };
    },
    hasInfluence: function(atSundown = false) {
        return (dude1, dude2) => {
            const inf1 = atSundown ? dude1.getSundownInfluence() : dude1.influence;
            const inf2 = atSundown ? dude2.getSundownInfluence() : dude2.influence;
            return booleanCondition(inf1, inf2);
        };
    },
    isSkilled: function() {
        return (dude1, dude2) => booleanCondition(dude1.isSkilled(), dude2.isSkilled());
    },
    isAtHome: function() {
        return (dude1, dude2) => booleanCondition(dude1.isAtHome(), dude2.isAtHome());
    },
    isInOpponentHome: function() {
        return (dude1, dude2) => {
            const isAtOppHome1 = dude1.isInOpponentsHome();
            const isAtOppHome2 = dude2.isInOpponentsHome();
            return booleanCondition(isAtOppHome1, isAtOppHome2);
        };
    },
    notControlledBy: function(player) {
        return (card1, card2) => booleanCondition(card1.controller !== player, card2.controller !== player);
    }
};

module.exports = Priorities;
