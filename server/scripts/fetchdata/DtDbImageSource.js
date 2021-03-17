/*eslint no-console:0 */
const fs = require('fs');
const jimp = require('jimp');
const request = require('request');

class DtDbImageSource {
    constructor() {
        this.packs = this.loadPacks();
    }

    loadPacks() {
        let files = fs.readdirSync('townsquare-json-data/packs');
        return files.map(file => JSON.parse(fs.readFileSync('townsquare-json-data/packs/' + file)));
    }

    fetchImage(card, imagePath) {
        if(!card.imagesrc) {
            console.log(`Could not fetch image for ${card.title} as there is no image srouce "imagesrc"`);
            return;
        }

        let imagesrc = card.imagesrc;
        let url = `http://dtdb.co/${imagesrc}`;

        request({ url: url, encoding: null }, function(err, response, body) {
            if(err || response.statusCode !== 200) {
                console.log(`Unable to fetch image for ${card.code} from ${url}`);
                return;
            }

            console.log('Downloading image for ' + card.code);
            jimp.read(body).then(lenna => {
                lenna.write(imagePath);
            }).catch(err => {
                console.log(`Error converting image for ${card.code}: ${err}`);
            });
        });
    }
}

module.exports = DtDbImageSource;
