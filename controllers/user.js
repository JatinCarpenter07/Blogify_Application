const express = require('express');
const usersDataModel = require('../models/usersData');
const blogsDataModel = require('../models/blogsData');
const { errorLog } = require('../middlewares');

async function userSignUp(req, res) {
    try {
        console.log("userSignUp : User signing up with email:", req.body.email);
        const { Name, email, password } = req.body;

        const userData = {
            Name,
            email,
            password
        };

        if (req.file) {
            userData.profileImage = `/uploads/${req.file.filename}`;
            console.log("userSignUp : User uploaded a profile image");
        }

        await usersDataModel.create(userData);

        const redirectUrl = req.session.previousUrl || "/";
        console.log("userSignUp : Redirecting to", redirectUrl);
        return res.redirect(302, redirectUrl);

    } catch (error) {
        console.log("userSignUp : Error", error);
        if (error.message.startsWith("E11000")) {
            error.message = "Already registered with this email";
        }

        errorLog(error, req);
        res.render("signup", { error });
    }
}

async function userLogIn(req, res) {
    try {
        console.log("userLogIn : User attempting to log in with email:", req.body.email);
        const { email, password } = req.body;

        const token = await usersDataModel.matchPasswordAndGenerateToken(email, password);
        console.log("userLogIn : Token generated for user");

        res.cookie('sessionId', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false // change to true if using HTTPS
        });

        const redirectUrl = req.session.previousUrl || "/";
        console.log("userLogIn : Redirecting to", redirectUrl);
        return res.redirect(302, redirectUrl);

    } catch (error) {
        console.log("userLogIn : Error", error);
        errorLog(error, req);
        res.render("login", { error });
    }
}

function userLogout(req, res) {
    try {
        console.log("userLogout : Logging out user, clearing session cookie");
        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: false // change to true if using HTTPS
        });

        res.redirect(302, '/');
    } catch (error) {
        console.log("userLogout : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function provideCustomizedAuthor(req, res) {
    try {
        console.log("provideCustomizedAuthor : Fetching author data for ID:", req.params.ID);
        const authorId = req.params.ID;

        const author = await usersDataModel.findById(authorId);
        const authorBlogs = await blogsDataModel.find({ createdBy: authorId });

        req.session.previousUrl = req.originalUrl;

        console.log("provideCustomizedAuthor : Rendering author page for", author.Name);
        return res.render("author", {
            user: req.user,
            author,
            authorBlogs
        });

    } catch (error) {
        console.log("provideCustomizedAuthor : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

module.exports = {
    userSignUp,
    userLogIn,
    userLogout,
    provideCustomizedAuthor
};
