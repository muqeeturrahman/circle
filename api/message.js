'use strict';

const { Router } = require('express');
const {sendMessage,getChatList,getMessages,deleteMessage,deleteMessageForEveryOne,clearChat,votePoll}=require("../controller/message")
const { handleMultipartData } = require("../utils/multipart");
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');
const { ROLES } = require('../utils/constants');

class MessageAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes () {
        const router = this.router;
        router.post('/send', AuthMiddleWare(Object.values(ROLES)), handleMultipartData.fields([{ name: 'media', maxCount: 500 }]), sendMessage);
        router.get('/getChatList', AuthMiddleWare(Object.values(ROLES)), getChatList);
        router.get('/getMessages', AuthMiddleWare(Object.values(ROLES)), getMessages);
        router.post('/deleteMessage/:messageId', AuthMiddleWare(Object.values(ROLES)), deleteMessage);
        router.put('/deleteMessageForEveryOne/:messageId', AuthMiddleWare(Object.values(ROLES)), deleteMessageForEveryOne);
        router.post('/clearChat', AuthMiddleWare(Object.values(ROLES)), clearChat);
        router.post('/votePoll', AuthMiddleWare(Object.values(ROLES)),  votePoll);

        // router.post('/removeChat', AuthMiddleWare(Object.values(ROLES)), removeChat);



    }

    getRouter () {
        return this.router;
    }

    getRouterGroup () {
        return '/message';
    }
}

module.exports = MessageAPI;