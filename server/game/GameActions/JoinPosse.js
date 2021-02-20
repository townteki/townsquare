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
            (params.isCardEffect || !params.moveToPosse || card.requirementsToJoinPosse(params.allowBooted).canJoin)
        );
    }

    createEvent({ card, options = {} }) {
        let params = this.getDefaultOptions(options);
        if(card.game.shootout.isJob() && !params.needToBoot) {
            params.needToBoot = card.requirementsToJoinPosse(params.allowBooted).needToBoot;
        }
        let toLeaderPosse = card.controller === card.game.shootout.leaderPlayer;
        return this.event('onDudeJoinedPosse', { card, leaderPosse: toLeaderPosse, options: params }, event => {
            event.card.game.shootout.addToPosse(event.card);
            if(event.card.game.shootout.isJob() && event.card.requirementsToJoinPosse(event.options.allowBooted).needToBoot) {
                event.card.controller.bootCard(event.card);
            }
            if(event.options.moveToPosse) {
                event.card.moveToShootoutLocation(event.options.needToBoot, event.options.allowBooted);
            }
        });
    }

    getDefaultOptions(options) {
        return {
            isCardEffect: options.isCardEffect || options.isCardEffect === false ? options.isCardEffect : true,
            moveToPosse: options.moveToPosse || options.moveToPosse === false ? options.moveToPosse : true,
            needToBoot: options.needToBoot || options.needToBoot === false ? options.needToBoot : false,
            allowBooted: options.allowBooted || options.allowBooted === false ? options.allowBooted : true
        };
    }
}

module.exports = new JoinPosse();
