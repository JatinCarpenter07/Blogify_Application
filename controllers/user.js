const express = require('express');
const usersDataModel = require('../models/usersData');
const { builtTheToken } = require('../services/auth');
const { createHmac } = require("crypto");

async function userSignUp(req, res) {
    console.log(req.body);
    const { Name, email, password } = req.body;
    try {
        await usersDataModel.create({
            Name: Name,
            email: email,
            password: password
        })
        res.redirect("/");
    }
    catch (error) {
        console.log
        if (error.message.startsWith("E11000"))  //error code for duplicate entry in mongoose
            error = "Already registered with this Mail";
        res.render("signup", { error: error });
    }
}

async function userLogIn(req, res) {
    const { email, password } = req.body;
    try {
        const token = await usersDataModel.matchPasswordAndGenerateToken(email, password);
        res.cookie('sessionId', token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            httpOnly: true,              // Not accessible via JS (for security)
            secure: false               // Set to true if using HTTPS
        });
        res.redirect("/");
    }
    catch (error) {
        res.render("login", { error: error });
    }
}

function userLogout(req, res){
    res.clearCookie('sessionId', {
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        httpOnly: true,              // Not accessible via JS (for security)
        secure: false               // Set to true if using HTTPS
    });
    res.redirect(302,'/');
}


module.exports = {
    userSignUp,
    userLogIn,
    userLogout
}

