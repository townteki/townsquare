'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RestrictedList = function () {
    function RestrictedList(rules) {
        _classCallCheck(this, RestrictedList);

        this.rules = rules;
        this.pods = rules.pods || [];
    }

    _createClass(RestrictedList, [{
        key: 'validate',
        value: function validate(cards) {
            var _this = this;

            var restrictedCardsOnList = cards.filter(function (card) {
                return _this.rules.restricted.includes(card.code);
            });
            var bannedCardsOnList = cards.filter(function (card) {
                return _this.rules.banned.includes(card.code);
            });
            var noBannedCards = true;

            var errors = [];

            if (restrictedCardsOnList.length > 1) {
                errors.push(this.rules.name + ': Contains more than 1 card on the restricted list: ' + restrictedCardsOnList.map(function (card) {
                    return card.name;
                }).join(', '));
            }

            if (bannedCardsOnList.length > 0) {
                noBannedCards = false;
                errors.push(this.rules.name + ': Contains cards that are not tournament legal: ' + bannedCardsOnList.map(function (card) {
                    return card.name;
                }).join(', '));
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.pods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pod = _step.value;

                    var podErrors = this.validateRestrictedPods({ pod: pod, cards: cards });
                    noBannedCards = noBannedCards && podErrors.length === 0;
                    errors = errors.concat(podErrors);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return {
                name: this.rules.name,
                valid: errors.length === 0,
                restrictedRules: restrictedCardsOnList.length <= 1,
                noBannedCards: noBannedCards,
                errors: errors,
                restrictedCards: restrictedCardsOnList,
                bannedCards: bannedCardsOnList
            };
        }
    }, {
        key: 'validateRestrictedPods',
        value: function validateRestrictedPods(_ref) {
            var pod = _ref.pod,
                cards = _ref.cards;

            var errors = [];

            var restrictedCard = cards.find(function (card) {
                return card.code === pod.restricted;
            });

            if (!restrictedCard) {
                return errors;
            }

            var cardsOnList = cards.filter(function (card) {
                return pod.cards.includes(card.code);
            });
            if (cardsOnList.length > 0) {
                errors.push(this.rules.name + ': ' + cardsOnList.map(function (card) {
                    return card.name;
                }).join(', ') + ' cannot be used with ' + restrictedCard.name);
            }

            return errors;
        }
    }]);

    return RestrictedList;
}();

module.exports = RestrictedList;