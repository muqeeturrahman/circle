'use strict';

const { Router } = require('express');
const { createReport, getAllUserReports } = require('../controller/report');
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');
const { ROLES } = require('../utils/constants');

class ReportAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/create-report', AuthMiddleWare(ROLES.ORGANIZATION), createReport);
        router.get('/get-user-reports', AuthMiddleWare(ROLES.ORGANIZATION), getAllUserReports);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/report';
    }
}

module.exports = ReportAPI; 