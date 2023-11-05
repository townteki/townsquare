const MessageService = require('./MessageService');
const ConfigService = require('./ConfigService');
const UserService = require('./UserService');
const BanlistService = require('./BanlistService');
const EventService = require('./EventService');

let services = {};

module.exports = {
    messageService: db => {
        if(!services.messageService) {
            services.messageService = new MessageService(db);
        }

        return services.messageService;
    },
    configService: () => {
        if(!services.configService) {
            services.configService = new ConfigService();
        }

        return services.configService;
    },
    userService: (db, configService) => {
        if(!services.userService) {
            services.userService = new UserService(db, configService);
        }

        return services.userService;
    },
    banlistService: (db) => {
        if(!services.banlistService) {
            services.banlistService = new BanlistService(db);
        }

        return services.banlistService;
    },
    eventService: (db) => {
        if(!services.eventService) {
            services.eventService = new EventService(db);
        }

        return services.eventService;
    }
};
