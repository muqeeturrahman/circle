'use strict';

const { Router } = require('express');
const AdminMiddleWare = require('../middlewares/AdminMiddleWare');
const { createVibes, createPrefences,getAllUsers, createCategories ,toggleEnableDisable,getGroupedData,updateEventStatus,getDeleteRequests,deleteRequestStatus } = require('../controller/admin');
const { ROLES } = require('../utils/constants');


class AdminAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/create-vibes', AdminMiddleWare([ROLES.ADMIN]), createVibes);
        router.post('/create-categories', AdminMiddleWare([ROLES.ADMIN]), createCategories);
        router.post('/create-prefences', AdminMiddleWare([ROLES.ADMIN]), createPrefences);
        router.post('/getAllUsers', AdminMiddleWare([ROLES.ADMIN]), getAllUsers);
        router.post('/toggleEnableDisable', AdminMiddleWare([ROLES.ADMIN]), toggleEnableDisable);
        router.post('/groupUsersByCriteria', AdminMiddleWare([ROLES.ADMIN]), getGroupedData);
        router.post('/updateEventStatus', AdminMiddleWare([ROLES.ADMIN]), updateEventStatus);
        router.get('/getDeleteRequests', AdminMiddleWare([ROLES.ADMIN]), getDeleteRequests);
        router.post('/deleteRequestStatus', AdminMiddleWare([ROLES.ADMIN]), deleteRequestStatus);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/admin';
    }
}

module.exports = AdminAPI; 