'use strict';

const { Router } = require('express');
const {getNotifications}=require("../controller/notification")
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');

const { ROLES } = require('../utils/constants');

class NotificationAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
    
          router.get('/getNotifications', AuthMiddleWare(Object.values(ROLES)), getNotifications);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/notification';
    }
}

module.exports = NotificationAPI