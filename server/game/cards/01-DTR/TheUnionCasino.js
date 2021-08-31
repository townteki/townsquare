const DeedCard = require('../../deedcard.js');
const PlayerOrderPrompt = require('../../gamesteps/playerorderprompt.js');

class TheUnionCasino extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Union Casino',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any', condition: card => card.gamelocation === this.uuid },
                cardType: ['dude']
            },
            handler: context => {
                this.game.queueStep(new TheUnionCasinoPrompt(this.game, context.player, this, context));
            }
        });
    }
}

class TheUnionCasinoPrompt extends PlayerOrderPrompt {
    constructor(game, player, casinoCard, context) {
        super(game, [player.name, player.getOpponent().name]);
        this.game = game;
        this.bets = {};
        this.bets[player.name] = 0;
        this.bets[player.getOpponent().name] = 0;
        this.betsPlaced = {};
        this.betsPlaced[player.name] = false;
        this.betsPlaced[player.getOpponent().name] = false;
        this.player = player;
        this.casinoCard = casinoCard;
        this.context = context;
    }

    activeCondition(player) {
        return super.activeCondition(player) && !this.betsPlaced[player.name];
    }

    activePrompt(player) {
        let betText = player === this.player ? 'Bet ' : 'Counter bet ';
        return {
            promptTitle: this.casinoCard.title,
            menuTitle: 'Place a ' + betText.toLowerCase(),
            buttons: [
                { text: ' + GR', arg: 'moreGR' },
                { text: betText + this.bets[player.name] + ' GR', arg: 'bet' },
                { text: ' - GR', arg: 'lessGR' }
            ]
        };
    }

    onMenuCommand(player, arg) {
        if(arg === 'bet') {
            this.betsPlaced[player.name] = true;
            player.spendGhostRock(this.bets[player.name]);
            if(player === this.player) {
                this.game.addMessage('{0} uses {1} and chooses {2} to bet {3} GR',
                    player, this.casinoCard, this.context.target, this.bets[player.name]);
            } else if(this.bets[this.player.name] - 4 >= this.bets[player.name]) {
                this.context.target.modifyControl(1);
                this.game.addMessage('{0} does a counter bet of {1} GR. {2} paid at least 4 GR more thus {2} gets 1 CP',
                    player, this.casinoCard, this.context.target, this.bets[player.name]);
            } else {
                this.game.addMessage('{0} uses {1} and chooses {2} to bet {3} GR. {2} did not pay at least 4 GR more thus betting fails',
                    player, this.casinoCard, this.context.target, this.bets[player.name]);
            }
            this.completePlayer();
            return true;
        }
        if(arg === 'moreGR') {
            if(this.bets[player.name] < player.getSpendableGhostRock({ activePlayer: player, context: this.context })) {
                this.bets[player.name] += 1;
            }
            return false;
        }
        if(arg === 'lessGR') {
            if(this.bets[player.name] > 0) {
                this.bets[player.name] -= 1;
            }
            return false;
        }
        return false;
    }
}

TheUnionCasino.code = '01074';

module.exports = TheUnionCasino;
