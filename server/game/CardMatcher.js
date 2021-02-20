const Matcher = require('./Matcher.js');

class CardMatcher {
    static isMatch(card, properties) {
        return (
            Matcher.containsValue(properties.type, card.getType()) &&
            Matcher.containsValue(properties.booted, card.booted) &&
            Matcher.containsValue(properties.location, card.location) &&
            Matcher.containsValue(properties.name, card.name) &&
            Matcher.anyValue(properties.keyword, keyword => card.hasKeyword(keyword)) &&
            Matcher.containsValue(properties.unique, card.isUnique()) &&
            Matcher.anyValue(properties.printedCostOrLower, amount => card.hasPrintedCost() && card.getPrintedCost() <= amount) &&
            Matcher.anyValue(properties.printedCostOrHigher, amount => card.hasPrintedCost() && card.getPrintedCost() >= amount) &&
            Matcher.anyValue(properties.printedStrengthOrLower, amount => card.hasPrintedStrength() && card.getPrintedStrength() <= amount) &&
            Matcher.anyValue(properties.printedStrengthOrHigher, amount => card.hasPrintedStrength() && card.getPrintedStrength() >= amount) &&
            Matcher.anyValue(properties.hasAttachments, hasAttachments => hasAttachments === (card.attachments.length > 0)) &&
            Matcher.anyValue(properties.inLeaderPosse, inLeaderPosse => card.isInLeaderPosse() === inLeaderPosse) &&
            Matcher.anyValue(properties.inOpposingPosse, inOpposingPosse => card.isInOpposingPosse() === inOpposingPosse) &&
            Matcher.anyValue(properties.participating, participating => !card.game.shootout || card.isParticipating() === participating) &&
            Matcher.anyValue(properties.wanted, wanted => card.getType() === 'dude' && card.isWanted() === wanted) &&
            Matcher.containsValue(properties.facedown, card.facedown) &&
            Matcher.containsValue(properties.parent, card.parent) &&
            Matcher.anyValue(properties.not, notProperties => !CardMatcher.isMatch(card, notProperties))
        );
    }

    static createMatcher(propertiesOrFunc) {
        if(typeof(propertiesOrFunc) === 'function') {
            return propertiesOrFunc;
        }

        return function(card, context) {
            return (
                CardMatcher.isMatch(card, propertiesOrFunc) &&
                Matcher.anyValue(propertiesOrFunc.controller, controller => card.controller === controller || CardMatcher.attachmentControllerMatches(controller, card, context)) &&
                Matcher.anyValue(propertiesOrFunc.condition, condition => condition(card, context))
            );
        };
    }

    /**
     * Creates a matcher function to determine whether an attachment can be
     * attached to a particular card based on the properties passed. It defaults
     * to only allowing attachments on dudes.
     */
    static createAttachmentMatcher(properties) {
        let defaultedProperties = Object.assign({ type: 'dude' }, properties);
        return function(card, context) {
            return (
                CardMatcher.isMatch(card, defaultedProperties) &&
                Matcher.anyValue(properties.controller, controller => card.controller === controller || CardMatcher.attachmentControllerMatches(controller, card, context))
            );
        };
    }

    static attachmentControllerMatches(controllerProp, card, context) {
        switch(controllerProp) {
            case 'any':
                return true;
            case 'current':
                return card.controller === context.player;
            case 'opponent':
                return card.controller !== context.player;
        }

        return false;
    }
}

module.exports = CardMatcher;
