const Priorities = {
    lowestInfluence: function() {
        return (dude1, dude2) => dude1.influence - dude2.influence;
    },
    highestBullets: function() {
        return (dude1, dude2) => dude2.bullets - dude1.bullets;
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
    draw: function(archetype) {
        return (dude1, dude2) => {
            if((!archetype.isDraw(dude1) && !archetype.isDraw(dude2)) || 
                (archetype.isDraw(dude1) && archetype.isDraw(dude2))) {
                return 0;
            }
            return archetype.isDraw(dude1) ? -1 : 1;
        };
    },
    unbootedCard: function() {
        return (card1, card2) => {
            if((!card1.booted && !card1.booted) || (card1.booted && card2.booted)) {
                return 0;
            }
            return card1.booted ? 1 : -1;   
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
    }
};

module.exports = Priorities;
