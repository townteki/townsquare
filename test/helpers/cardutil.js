const CardUtil = {
    matchCardByNameAndPack(labelOrName) {
        var title = labelOrName;
        var pack;
        var match = labelOrName.match(/^(.*)\s\((.*)\)$/);
        if(match) {
            title = match[1];
            pack = match[2];
        }

        return function(cardData) {
            return cardData.title === title && (!pack || cardData.pack_code === pack);
        };
    }
};

module.exports = CardUtil;
