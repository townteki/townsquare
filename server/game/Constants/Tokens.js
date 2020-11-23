const Tokens = {
    bounty: 'bounty',
    ghostrock: 'ghostrock',
    includes: token => {
        return Object.values(Tokens).includes(token.toLowerCase());
    }
};

module.exports = Tokens;
