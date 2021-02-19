class CannotRestriction {
    static forAnyPlayType(type, condition, controller) {
        return new CannotRestriction(type, 'any', controller, condition);
    }

    static forAnyType(playType, condition, controller) {
        return new CannotRestriction('any', playType, controller, condition);
    }

    constructor(type, playType, controller = 'any', condition = () => true) {
        this.type = type;
        this.playType = playType;
        this.controller = controller;
        this.condition = condition;
    }

    isMatch(type, abilityContext, targetController) {
        let abilityPlayType = abilityContext.ability ? abilityContext.ability.playTypePlayed() : 'game';
        return (this.type === type || this.type === 'any') &&
            (this.playType === abilityPlayType || this.playType === 'any') && 
            this.matchesController(abilityContext.player, targetController) && 
            this.checkCondition(abilityContext);
    }

    matchesController(abilityPlayer, targetController) {
        if(this.controller === 'any') {
            return true;
        }
        if(this.controller === 'current') {
            return targetController === abilityPlayer;
        }
        if(this.controller === 'opponent') {
            return targetController !== abilityPlayer;
        }
    }

    checkCondition(context) {
        if(!this.condition) {
            return true;
        }

        return this.condition(context);
    }
}

module.exports = CannotRestriction;
