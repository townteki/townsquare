/*eslint no-console:0 */
const monk = require('monk');
const _ = require('underscore');

let db = monk('mongodb://127.0.0.1:27017/townsquare');

let dbDecks = db.get('decks');

const fixBanners = async () => {
    let count = await dbDecks.count({});
    console.info(count, 'decks to process');
    let numberProcessed = 0;
    let chunkSize = 5000;
    let numberFound = 0;

    while(numberProcessed < count) {
        let decks = await dbDecks.find({}, { limit: chunkSize, skip: numberProcessed });
        console.info('loaded', _.size(decks), 'decks');
        for(let deck of decks) {
            if(deck.drawCards.some(card => card.card.text) || (deck.legend && deck.legend.text) || deck.outfit.title) {
                numberFound++;

                for(const drawCard of deck.drawCards) {
                    drawCard.card = { code: drawCard.card.code };
                }

                await dbDecks.update({ _id: deck._id }, {
                    '$set': {
                        drawCards: deck.drawCards,
                        legend: deck.legend ? { code: deck.legend.code } : undefined,
                        outfit: deck.outfit.title
                    }
                });
            }
        }

        numberProcessed += _.size(decks);
        console.info('processed', numberProcessed, 'decks');
    }

    console.info('found and fixed', numberFound);
    db.close();
};

fixBanners();
