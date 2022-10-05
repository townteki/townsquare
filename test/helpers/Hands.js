const Hands = {
    HighCard: ['Circle M Ranch', 'Ambush', 'Shotgun', 'Buffalo Rifle', 'Pistol Whip'],
    TwoOfKind: ['Hustings', 'Ambush', 'Shotgun', 'Buffalo Rifle', 'Pistol Whip'],
    TwoPairs: ['Hustings', 'Ambush', 'Shotgun', 'Buffalo Rifle', 'Pistol Whip'],
    ThreeOfKind: ['Mustang', 'Ambush', 'Bad Company', 'Buffalo Rifle', 'Pistol Whip'],
    Straight: ['Mustang', 'Ambush', 'Roan', 'Circle M Ranch', 'Blake Ranch'],
    Flush: ['Hustings', 'Circle M Ranch', 'Circle M Ranch', 'Jackson\'s Strike', 'Blake Ranch'],
    FullHouse: ['Mustang', 'Jackson\'s Strike', 'Bad Company', 'Buffalo Rifle', 'Pistol Whip'],
    getHand: (player, handRank) => {
        let drawHand = [];
        drawHand.push(player.filterCardsByName(handRank[0])[0]);
        drawHand.push(player.filterCardsByName(handRank[1])[0]);
        drawHand.push(player.filterCardsByName(handRank[2])[0]);
        drawHand.push(player.filterCardsByName(handRank[3])[0]);
        drawHand.push(player.filterCardsByName(handRank[4])[0]);
        return drawHand;
    }
};

module.exports = Hands;
