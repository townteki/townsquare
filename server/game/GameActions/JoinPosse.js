const GameAction = require('./GameAction');

class JoinPosse extends GameAction {
    constructor() {
        super('joinPosse');
    }

    canChangeGameState({ card, options = {} }) {
        let params = this.getDefaultOptions(options);
        return (
            card.game.shootout &&
            card.getType() === 'dude' &&
            ['outfit', 'play area'].includes(card.location) &&
            (params.isCardEffect || !params.moveToPosse || card.canJoinPosse(params.allowBooted))
        );
    }

    createEvent({ card, options = {} }) {
        let params = this.getDefaultOptions(options);
        let toLeaderPosse = card.controller === card.game.shootout.leaderPlayer;
        return this.event('onDudeJoinedPosse', { card, leaderPosse: toLeaderPosse, options: params }, event => {
            event.card.game.shootout.addToPosse(event.card);
            if (event.options.moveToPosse) {
                event.card.moveToShootoutLocation(event.options.needToBoot, event.options.allowBooted);
            }
        });
    }

    getDefaultOptions(options) {
        return {
            isCardEffect: options.isCardEffect != null ? options.isCardEffect : true,
            moveToPosse: options.moveToPosse != null ? options.moveToPosse : true,
            needToBoot: options.needToBoot != null ? options.needToBoot : false,
            allowBooted: options.allowBooted != null ? options.allowBooted : true
        }
    }
}

module.exports = new JoinPosse();
