const DudeCard = require('../../dudecard.js');

class XiaodanLi extends DudeCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.startingSize = 0;
    }
}

XiaodanLi.code = '09006';

module.exports = XiaodanLi;
