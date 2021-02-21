/*eslint no-console: 0*/

const _ = require('underscore');
const monk = require('monk');

const GameService = require('./services/GameService.js');
const config = require('./config.js');

let db = monk(config.dbPath);
let gameService = new GameService(db);

let args = process.argv.slice(2);

if(_.size(args) < 2) {
    console.error('Must provide start and end date');

    db.close();
    return;
}

console.info('Running stats between', args[0], 'and', args[1]);

gameService.getAllGames(args[0], args[1]).then(games => {
    let rejected = { singlePlayer: 0, noWinner: 0 };

    console.info('' + _.size(games), 'total games');

    let players = {};
    let outfits = {};

    _.each(games, game => {
        if(_.size(game.players) !== 2) {
            rejected.singlePlayer++;

            return;
        }

        if(!game.winner) {
            rejected.noWinner++;

            return;
        }

        _.each(game.players, player => {
            if(!players[player.name]) {
                players[player.name] = { name: player.name, wins: 0, losses: 0 };
            }

            if(!outfits[player.outfit.title]) {
                outfits[player.outfit.title] = { name: player.outfit.title, wins: 0, losses: 0 };
            }

            var playerStat = players[player.name];
            var outfitStat = outfits[player.outfit];

            if(player.name === game.winner) {
                playerStat.wins++;
                outfitStat.wins++;
            } else {
                playerStat.losses++;
                outfitStat.losses++;
            }
        });
    });

    let winners = _.chain(players).sortBy(player => {
        return -player.wins;
    }).first(10).value();

    let winRates = _.map(winners, player => {
        let games = player.wins + player.losses;

        return { name: player.name, wins: player.wins, losses: player.losses, winRate: Math.round(((player.wins / games) * 100)) };
    });

    let winRateStats = _.chain(winRates).sortBy(player => {
        return -player.winRate;
    }).first(10).value();

    let outfitWinRates = _.map(outfits, outfit => {
        let games = outfit.wins + outfit.losses;

        return { name: outfit.name, wins: outfit.wins, losses: outfit.losses, winRate: Math.round(((outfit.wins / games) * 100)) };
    });

    let outfitWinRateStats = _.sortBy(outfitWinRates, outfit => {
        return - outfit.winRate;
    });

    console.info('### Top 10\n\nName | Number of wins\n----|----------------');

    _.each(winners, winner => {
        console.info(winner.name, ' | ', winner.wins);
    });

    console.info('### Top 10 by winrate\n\nName | Number of wins | Number of losses | Win Rate\n----|-------------|------------------|--------');

    _.each(winRateStats, winner => {
        console.info(winner.name, ' | ', winner.wins, ' | ', winner.losses, ' | ', winner.winRate + '%');
    });

    console.info('### outfit win rates\n\noutfit | Number of wins | Number of losses | Win Rate\n----|-------------|------------------|--------');

    _.each(outfitWinRateStats, winner => {
        console.info(winner.name, ' | ', winner.wins, ' | ', winner.losses, ' | ', winner.winRate + '%');
    });

    console.info(rejected);
})
    .then(() => db.close())
    .catch(() => db.close());
