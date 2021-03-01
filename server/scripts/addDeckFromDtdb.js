const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { once } = require('events');
const _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017';

MongoClient.connect(url, async function(err, db) {
    if(err) {
        throw err;
    }
    var dbo = db.db('townsquare');
    var decks = await loadDeckFiles('c:\\Melo\\GitHub\\townsquare\\townsquare-json-data\\');

    _.each(decks, deck => {
        dbo.collection('decks').insertOne(deck, function(err) {
            if(err) {
                throw err;
            }
            db.close();
        });
    });

    console.log(decks.length + ' document(s) inserted into townsquare.decks');
});

async function loadDeckFiles(directory) {
    let decks = [];
    let files = fs.readdirSync(path.join(directory, 'decks'));
    for(let file of files) {
        let deck = await parseDeck(path.join(directory, 'decks', file));
        decks.push(deck);
    }

    return decks;
}

async function parseDeck(path) {
    const fileStream = fs.createReadStream(path);
  
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    var name = '';
    var outfit = { type_code: 'outfit', type: 'Outfit', quantity: '1' };
    var cards = [];
    var re1Line = /^#{1,1} (.*)$/;
    var reOutfit = /^\[(.*)\]\(http:\/\/dtdb\.co\/en\/card\/([0-9]*)\).*$/;
    var reCard = /^\* ([1-9])x \[.*\]\(http:\/\/dtdb\.co\/en\/card\/([0-9]*)\)(\*?).*$/;

    rl.on('line', (line) => {
        var found = line.match(re1Line);
        if(found) {
            name = found[1];
        } else {
            found = line.match(reOutfit);
            if(found) {
                outfit.title = found[1];
                outfit.code = found[2];
            } else {
                found = line.match(reCard);
                if(found) {
                    cards.push({ card: { code: found[2] }, count: found[1], starting: found[3] === '*' ? 1 : 0 });
                }
            }
        }
    });

    await once(rl, 'close');

    console.log(`File ${path} processed`);

    return { 
        name: name,
        outfit: outfit,
        legend: null, 
        drawCards: cards,
        lastUpdated: '2021-03-01T08:00:00.000+00:00',
        standaloneDeckId: ''
    };
}

