'use strict';

const { Router } = require('express');
const { createService, updateService, getUserServices , filerServices, getAllTheVerifiedService, deleteService, getServiceForHomeScreen, fetchServices,getService,serviceAnalytics,favoriteServiceToggle,favoriteServicesList} = require('../controller/service');
const {createBooking,getBookings,cancelBooking}=require("../controller/booking")
const {createBookingReview,getReviews}=require("../controller/Review")
const AuthMiddleWare = require('../middlewares/AuthMiddleWare');
const { handleMultipartData } = require("../utils/multipart");
const { ROLES } = require('../utils/constants');

class ServiceAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/create-service', AuthMiddleWare(Object.values(ROLES)), handleMultipartData.fields([
            {
              name: "media",
              maxCount: 50,
            }

          ]), createService);

          router.post('/update-service', AuthMiddleWare(Object.values(ROLES)), handleMultipartData.fields([
            {
              name: "media",
              maxCount: 50,
            }

          ]), updateService);

          router.get('/get-service', AuthMiddleWare(Object.values(ROLES)), getUserServices);
          router.post('/delete-service', AuthMiddleWare(Object.values(ROLES)), deleteService )
          router.post('/search', AuthMiddleWare(Object.values(ROLES)), fetchServices);
          router.post('/get-services-by-status', AuthMiddleWare((ROLES)), getServiceForHomeScreen);
          router.post("/filter-services", AuthMiddleWare((ROLES)), filerServices)
          router.post('/createBooking', AuthMiddleWare((ROLES.USER)), createBooking);
          router.get('/getBookings', AuthMiddleWare((ROLES.USER)), getBookings);
          router.post('/cancelBooking', AuthMiddleWare((ROLES.USER)), cancelBooking);
          router.post('/createBookingReview', AuthMiddleWare(([ROLES.USER])), createBookingReview);
          router.post('/clickCount/:id', AuthMiddleWare([ROLES.USER]), getService);
          router.get('/servicesAnalytics', AuthMiddleWare([ROLES.ORGANIZATION]), serviceAnalytics);
          router.post('/getReviews', AuthMiddleWare([ROLES.USER]), getReviews);
          router.get('/get-recommendations', AuthMiddleWare((ROLES.USER)), getAllTheVerifiedService);
          router.post('/favoritestoggle', AuthMiddleWare([ROLES.USER]), favoriteServiceToggle);
          router.get('/favoriteslist', AuthMiddleWare([ROLES.USER]), favoriteServicesList);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/service';
    }
}

module.exports = ServiceAPI