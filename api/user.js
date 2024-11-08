'use strict';

const { Router } = require('express');
const { verifyOtp, generateOTP } = require('../controller/otp');
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');
const { getVibes, getCategories, getPrefences, createorUpdateMoods, getUserMoods, NotificationOn, getusersbyname  } = require('../controller/user');
const { ROLES } = require('../utils/constants');

class UserAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.get('/get-vibes', AuthMiddleWare(), getVibes);
        router.get('/get-categories', AuthMiddleWare(), getCategories);
        router.get('/get-prefences', AuthMiddleWare(), getPrefences);
        router.post('/create-set-mood', AuthMiddleWare(), createorUpdateMoods);
        router.get('/get-mood-user', AuthMiddleWare(), getUserMoods);      
        router.post('/update-notification-status', AuthMiddleWare(Object.values(ROLES)), NotificationOn)
        router.post('/getusersbyusername', AuthMiddleWare(Object.values(ROLES)), getusersbyname)

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}

module.exports = UserAPI; 