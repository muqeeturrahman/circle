'use strict';

const { Router } = require('express');
const { verifyOtp, generateOTP, verifyforgotOtp, forgotPassword } = require('../controller/otp');
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');

class OtpAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/verify-otp', AuthMiddleWare(), verifyOtp);
        router.post('/verify-fogot-otp', AuthMiddleWare(), verifyforgotOtp);
        router.post("/generate-otp",generateOTP)
        router.post("/send-otp",forgotPassword)

      

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/otp';
    }
}

module.exports = OtpAPI; 