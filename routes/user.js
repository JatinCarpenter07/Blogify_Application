const express = require('express');
const userRouter = express.Router();
const { userSignUp, userLogIn, userLogout, provideCustomizedAuthor } = require('../controllers/user');
const { render } = require('ejs');
const { upload } = require('./blog');

userRouter.get('/signup', (req, res) => {
    console.log("GET /signup - Rendering signup page");
    res.render("signup");
});

userRouter.post('/signup', upload.single("profileImage"), (req, res, next) => {
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

userRouter.get('/logout', (req, res, next) => {
    console.log("GET /logout - Logging out user");
    userLogout(req, res, next);
});

userRouter.get('/author/:ID', (req, res, next) => {
    console.log(`GET /author/${req.params.ID} - Viewing author page`);
    provideCustomizedAuthor(req, res, next);
});

module.exports = userRouter;
