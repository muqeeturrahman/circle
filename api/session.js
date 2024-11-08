'use strict';

const { Router } = require('express');
const { sessionCreate,joinSession,getMySessions,getSessionDetailsById,removeUser,leavesession,Endsession,getServices
    ,startSession,getMyJoinedSessions,sendInvitation
} = require('../controller/session');
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');

class sessionAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/sessionCreate', AuthMiddleWare(), sessionCreate);
        router.post('/joinsession', AuthMiddleWare(), joinSession);
        router.get('/getmysessions', AuthMiddleWare(), getMySessions);
        router.post('/getSessionDetailsById', AuthMiddleWare(), getSessionDetailsById);
        router.post('/removeUserFromSession', AuthMiddleWare(), removeUser);
        router.post('/leaveUserFromSession', AuthMiddleWare(), leavesession);
        router.post('/endsession', AuthMiddleWare(), Endsession);
        router.post('/startsession', AuthMiddleWare(), startSession);
        router.get('/myjoinedsessions', AuthMiddleWare(), getMyJoinedSessions);
        router.get('/get-recommendations', AuthMiddleWare(), getServices);

        router.post('/sendinvitation', AuthMiddleWare(), sendInvitation);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/session';
    }
}

module.exports = sessionAPI; 