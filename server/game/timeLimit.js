const moment = require('moment');

class TimeLimit {
    constructor(game) {
        this.game = game;
        this.timeLimitStartType = null;
        this.timeLimitStarted = false;
        this.timeLimitStartedAt = null;
        this.timeLimitInSeconds = null;
        this.isTimeLimitReached = false;
        this.isPaused = false;
        this.pausedSeconds = 0;
    }

    initialiseTimeLimit(timeLimitStartType, timeLimitInMinutes) {
        this.timeLimitStartType = timeLimitStartType;
        this.timeLimitInSeconds = timeLimitInMinutes * 60;
        if(timeLimitStartType === 'whenSetupFinished') {
            this.game.on('onSetupFinished', () => this.startTimer());
        }
        if(timeLimitStartType === 'whenFirstLowballRevealed') {
            this.game.once('onDrawHandsRevealed', () => this.startTimer());
        }   
    }

    startTimer() {
        if(!this.timeLimitStarted) {
            this.timeLimitStarted = true;
            this.timeLimitStartedAt = new Date();

            this.timer = setInterval(() => {
                if(this.isPaused) {
                    this.pausedSeconds += 1;
                }
                this.checkForTimeLimitReached();
            }, 1000);
        }
    }

    togglePauseTimer() {
        this.isPaused = !this.isPaused;
    }

    checkForTimeLimitReached() {
        if(this.game.useGameTimeLimit && !this.isTimeLimitReached) {
            let differenceBetweenStartOfTimerAndNow = moment.duration(moment().diff(this.timeLimitStartedAt));
            if(differenceBetweenStartOfTimerAndNow.asSeconds() >= this.timeLimitInSeconds + this.pausedSeconds) {
                this.game.addAlert('warning', 'Time up.  The game will end after the current round has finished');
                this.isTimeLimitReached = true;
                this.timeLimitStarted = false;
                this.game.timeExpired();
            }
        } else if(this.isTimeLimitReached && this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
}

module.exports = TimeLimit;
