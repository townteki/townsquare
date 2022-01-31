const MathHelper = {
    /**
     * Returns the random int number from range 0 to max - 1.
     *
     */
    randomInt: function(max) {
        return Math.floor(Math.random() * max);
    }
};

module.exports = MathHelper;
