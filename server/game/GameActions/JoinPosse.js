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

    createEvent({ card, options = {}, context }) {
        let params = this.getDefaultOptions(options);
        params.context = context;
        if(card.game.shootout.isJob() && !params.needToBoot) {
            params.needToBoot = card.requirementsToJoinPosse(params.allowBooted).needToBoot;
        }
        let toLeaderPosse = card.controller === card.game.shootout.leaderPlayer;
        card.game.raiseEvent('onDudeJoiningPosse', { card, leaderPosse: toLeaderPosse, options: params });

        return this.event('_DO_NOT_USE_', { card, leaderPosse: toLeaderPosse, options: params }, event => {
            let bootingReq = 'not-needed';
            if(event.card.game.shootout.isJob() && event.card.requirementsToJoinPosse(event.options.allowBooted).needToBoot && 
                !event.card.canJoinWithoutBooting()) {
                if(card.allowGameAction('boot', context, options)) {
                    bootingReq = 'do-boot';
                } else {
                    bootingReq = 'not-met';
                } 
            }
            if(bootingReq === 'not-needed' || bootingReq === 'do-boot') {
                event.card.game.shootout.addToPosse(event.card);
                if(bootingReq === 'do-boot') {
                    event.card.controller.bootCard(event.card);
                }
                if(event.options.moveToPosse) {
                    if(!event.card.moveToShootoutLocation(event.options)) {
                        event.card.game.shootout.removeFromPosse(event.card);
                        return;
                    }
                }
                card.game.raiseEvent('onDudeJoinedPosse', { card: event.card, leaderPosse: event.leaderPosse, options: event.options });
            }
        });
    }

    getDefaultOptions(options = {}) {
        const defaultOptions = {
            isCardEffect: options.isCardEffect || options.isCardEffect === false ? options.isCardEffect : true,
            moveToPosse: options.moveToPosse || options.moveToPosse === false ? options.moveToPosse : true,
            needToBoot: options.needToBoot || options.needToBoot === false ? options.needToBoot : false,
            allowBooted: options.allowBooted || options.allowBooted === false ? options.allowBooted : true
        };
        return Object.assign(options, defaultOptions);
    }
}

module.exports = new JoinPosse();
