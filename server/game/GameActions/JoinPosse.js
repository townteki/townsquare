const GameAction = require('./GameAction');
const AddBounty = require('./AddBounty');
const { BountyType } = require('../Constants');

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
        if(card.game.shootout.isJob() && !params.needToBoot && !params.isCardEffect) {
            params.needToBoot = card.requirementsToJoinPosse(params.allowBooted).needToBoot;
        }
        let toLeaderPosse = card.controller.equals(card.game.shootout.leaderPlayer);
        card.game.raiseEvent('onDudeJoiningPosse', { card, leaderPosse: toLeaderPosse, options: params });

        return this.event('_DO_NOT_USE_', { card, leaderPosse: toLeaderPosse, options: params }, event => {
            let bootingReq = 'not-needed';
            const shootout = event.card.game.shootout;
            if(shootout.isJob() && event.options.needToBoot && !event.card.canJoinWithoutBooting()) {
                if(event.card.allowGameAction('boot', context, options)) {
                    bootingReq = 'do-boot';
                } else {
                    bootingReq = 'not-met';
                } 
            }
            if(bootingReq === 'not-needed' || bootingReq === 'do-boot') {
                shootout.addToPosse(event.card);
                if(bootingReq === 'do-boot') {
                    event.card.controller.bootCard(event.card);
                }
                if(event.options.moveToPosse) {
                    if(!event.card.moveToShootoutLocation(event.options)) {
                        shootout.removeFromPosse(event.card);
                        return;
                    }
                }
                if(!event.options.doNotPutBounty && shootout.isBreakinAndEnterin(event.card)) {
                    event.thenAttachEvent(AddBounty.createEvent({ card: event.card, reason: BountyType.breaking }));
                }
                event.card.game.raiseEvent('onDudeJoinedPosse', { card: event.card, leaderPosse: event.leaderPosse, options: event.options });
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
