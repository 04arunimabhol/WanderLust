const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, 
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), 
        wrapAsync(userController.login)
    );

router
    .route("/forgotPassword")
    .get(userController.renderForgotPasswordForm)
    .post(wrapAsync(userController.forgotPassword));
    

router
    .route("/resetPassword/:token")
    .get(userController.renderResetPasswordForm)
    .patch(wrapAsync(userController.resetPassword));


router.get("/logout", userController.logout);

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.googleLogin
);

module.exports = router;