const Settings = require('../settings');
const crypto = require('crypto');

const DefaultEmailHash = crypto.createHash('md5').update('noreply@doomtown.online').digest('hex');
class User {
    constructor(userData) {
        this.userData = userData;
    }

    get _id() {
        return this.userData._id;
    }

    get disabled() {
        return this.userData.disabled;
    }

    get username() {
        return this.userData.username;
    }

    get tokens() {
        return this.userData.tokens;
    }

    get activationToken() {
        return this.userData.activationToken;
    }

    get activationTokenExpiry() {
        return this.userData.activationTokenExpiry;
    }

    get resetToken() {
        return this.userData.resetToken;
    }

    get tokenExpires() {
        return this.userData.tokenExpires;
    }

    get blockList() {
        return this.userData.blockList || [];
    }

    set blockList(value) {
        this.userData.blockList = value;
    }

    get password() {
        return this.userData.password;
    }

    get permissions() {
        return this.userData.permissions || [];
    }

    get email() {
        return this.userData.email;
    }

    get enableGravatar() {
        return this.userData.enableGravatar;
    }

    get verified() {
        return this.userData.verified;
    }

    get registered() {
        return this.userData.registered;
    }

    get isAdmin() {
        return this.userData.permissions && this.userData.permissions.isAdmin;
    }

    get isContributor() {
        return this.userData.permissions && this.userData.permissions.isContributor;
    }

    get isSupporter() {
        return this.userData.permissions && this.userData.permissions.isSupporter;
    }

    get role() {
        if(this.isAdmin) {
            return 'admin';
        }

        if(this.isContributor) {
            return 'contributor';
        }

        if(this.isSupporter) {
            return 'supporter';
        }

        return 'user';
    }

    block(otherUser) {
        this.userData.blockList = this.userData.blockList || [];
        this.userData.blockList.push(otherUser.username.toLowerCase());
    }

    hasUserBlocked(otherUser) {
        return this.blockList.includes(otherUser.username.toLowerCase());
    }

    getAvatarLink() {
        let emailHash = this.enableGravatar ? crypto.createHash('md5').update(this.email).digest('hex') : DefaultEmailHash;
        return `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
    }

    getFullDetails() {
        let user = Object.assign({}, this.userData);

        delete user.password;

        user = Settings.getUserWithDefaultsSet(user);
        user.avatarLink = this.getAvatarLink();

        return user;
    }

    getWireSafeDetails() {
        let user = {
            _id: this.userData._id,
            username: this.userData.username,
            email: this.userData.email,
            settings: this.userData.settings,
            permissions: this.userData.permissions,
            verified: this.userData.verified,
            enableGravatar: this.userData.enableGravatar,
            avatarLink: this.getAvatarLink(),
            discord: {}
        };

        user = Settings.getUserWithDefaultsSet(user);

        return user;
    }

    getShortSummary() {
        return {
            username: this.username,
            name: this.username,
            role: this.role
        };
    }

    getDetails() {
        let user = Object.assign({}, this.userData);

        delete user.password;
        delete user.tokens;

        user = Settings.getUserWithDefaultsSet(user);
        user.role = this.role;
        user.avatarLink = this.getAvatarLink();

        return user;
    }
}

module.exports = User;
