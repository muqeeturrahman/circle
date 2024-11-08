"use strict";

const { Router } = require("express");
const {
  register,
  verifytoken,
  createProfile,
  login,
  changePassword,
  updateProfile,
  deleteAccount,
  deleteRequest
} = require("../controller/auth");
const authMiddleware = require("../middlewares/AuthMiddleWare");
const { ROLES } = require('../utils/constants');
const { handleMultipartData } = require("../utils/multipart");
const { object } = require("joi");

class AuthAPI {
  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    const router = this.router;
    router.post("/register", register);
    router.post("/verify-token", verifytoken);
    router.post("/change-password", authMiddleware(), changePassword);
    router.post("/deleteAccount", authMiddleware(Object.values(ROLES)), deleteAccount);
    router.post("/deleteRequest", authMiddleware(Object.values(ROLES)), deleteRequest);
    router.post(
      "/create-profile",
      authMiddleware(),
      handleMultipartData.fields([
        {
          name: "profileImage",
          maxCount: 1,
        },
        {
          name: "portfolioImage",
          maxCount: 5,
        },
      ]),
      createProfile
    );
    router.put(
      "/update-profile",
      authMiddleware(),
      handleMultipartData.fields([
        {
          name: "profileImage",
          maxCount: 1,
        },
        {
          name: "portfolioImage",
          maxCount: 10,
        },
      ]),
      updateProfile
    );
    router.post("/login", login);
  }

  getRouter() {
    return this.router;
  }

  getRouterGroup() {
    return "/auth";
  }
}

module.exports = AuthAPI;
