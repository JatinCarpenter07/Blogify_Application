const express = require('express');
const userRouter = express.Router();
const { userSignUp, userLogIn, userLogout, provideCustomizedAuthor, verifyEmail, verifyOtp, passEmailVerify, newPasswordSet, passOtpVerify } = require('../controllers/user');
const { render } = require('ejs');
const { upload } = require('./blog');


userRouter.get('/verifyEmail', (req, res) => {
    console.log("GET /verifyEmail - Rendering verifyEmail page");
    res.render("verifyEmail");
});

userRouter.post('/verifyEmail', (req, res,next) => {
    console.log("POST /verifyEmail - Submitting emails details");
    verifyEmail(req,res,next);
});

userRouter.post('/verifyOtp/:emailEntered', (req, res,next) => {
    console.log("POST /verifyOtp -verifying otp details");
    verifyOtp(req,res,next);
});

userRouter.post('/signup/:emailEntered', upload.single("profileImage"), (req, res, next) => {
    console.log("POST /signup - Submitting signup form");
    userSignUp(req, res, next);
});

userRouter.get('/login', (req, res) => {
    console.log("GET /login - Rendering login page");
    res.render("login");
});

userRouter.post('/login', (req, res, next) => {
    console.log("POST /login - Submitting login form");
    userLogIn(req, res, next);
});

userRouter.get('/passEmailVerify', (req, res) => {
    console.log("GET /passEmailVerify - Rendering passEmailVerify page");
    res.render("passEmailVerify");
});

userRouter.post('/passEmailVerify', (req, res,next) => {
    console.log("post /passEmailVerify - verifying passEmailVerify details");
    passEmailVerify(req,res,next)
});

userRouter.post('/passOtpVerify/:emailEntered', (req, res,next) => {
    console.log("post /passOtpVerify - verifying passOtpVerify details");
    passOtpVerify(req,res,next)
});

userRouter.post('/newPasswordSet/:emailEntered', (req, res,next) => {
    console.log("post /newPasswordSet - verifying newPasswordSet details");
    newPasswordSet(req,res,next)
});

userRouter.get('/logout', (req, res, next) => {
    console.log("GET /logout - Logging out user");
    userLogout(req, res, next);
});

userRouter.get('/author/:ID', (req, res, next) => {
    console.log(`GET /author/${req.params.ID} - Viewing author page`);
    provideCustomizedAuthor(req, res, next);
});

module.exports = userRouter;
