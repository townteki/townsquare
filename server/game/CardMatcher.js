const Matcher = require('./Matcher.js');

/** @typedef {import('./AbilityContext')} AbilityContext */
/** @typedef {import('./basecard')} BaseCard */

/** 
 * @typedef {Object} CardMatcherProps
 * Represents a properties that should match card presented to
 * be selected.
 *
 * Properties:
 * @property {string} location - string that represents card location.
 * @property {string} controller - string that represents card controller. 
 * @property {(card: BaseCard, context: AbilityContext) => boolean} condition - 
 *          optional condition with parameters `card` and `context`.
 * @property {boolean} keyword - .
 * @property {boolean} booted - .
 * @property {boolean} unique - .
 * @property {boolean} hasAttachments - .
 * @property {boolean} inLeaderPosse - .
 * @property {boolean} inOpposingPosse - .
 * @property {boolean} participating - .
 * @property {boolean} wanted - .
 * @property {boolean} facedown - .
 * @property {boolean} parent - .
 */
class CardMatcher {
    static isMatch(card, properties) {
        return (
            Matcher.containsValue(properties.type, card.getType()) &&
            Matcher.containsValue(properties.booted, card.booted) &&
            Matcher.containsValue(properties.location, card.location) &&
            Matcher.containsValue(properties.title, card.title) &&
            Matcher.anyValue(properties.keyword, keyword => card.hasKeyword(keyword)) &&
            Matcher.containsValue(properties.unique, card.isUnique()) &&
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
                (card.getType() === 'townsquare' || CardMatcher.isMatch(card, propertiesOrFunc)) &&
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
