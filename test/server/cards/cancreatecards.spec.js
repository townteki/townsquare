const cards = require('../../../server/game/cards');

describe('All Cards', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['on', 'removeListener', 'addPower', 'addMessage', 'addEffect', 'onceConditional', 'once', 'getPlayers', 'isLegacy']);
        this.playerSpy = jasmine.createSpyObj('player', ['registerAbilityMax']);
        this.playerSpy.game = this.gameSpy;
        this.hasAncestor = (cardClass, ancestorClassName) => {
            let prot = Object.getPrototypeOf(cardClass);
            while(prot && prot.name !== cardClass.name && prot.name !== ancestorClassName) {
                prot = Object.getPrototypeOf(prot);
            }
            return prot && prot.name === ancestorClassName;
        };
    });

    for(let cardClass of Object.values(cards)) {
        it('should be able to create \'' + cardClass.name + '\' and set it up', function() {
            // No explicit assertion - if this throws an exception it will fail
            // and give us a better stacktrace than the expect().not.toThrow()
            // assertion.
            let cardData = {};
            if(this.hasAncestor(cardClass, 'SpellCard')) {
                cardData = { type_code: 'spell' };
            }
            if(this.hasAncestor(cardClass, 'TechniqueCard')) {
                cardData = { keywords: 'technique', type_code: 'action' };
            }
            new cardClass(this.playerSpy, cardData);
        });
    }
});
