const express = require('express');
const usersDataModel = require('../models/usersData');
const blogsDataModel = require('../models/blogsData');
const { errorLog } = require('../middlewares');
const { generateOTP, sendOTP } = require('../services/emailVerification');
const emailVerificationDataModel = require('../models/emailVerficationData');

async function userSignUp(req, res) {
    try {
        const emailEntered = req.params.emailEntered;
        console.log("emailEntered :",emailEntered);
        const check = await emailVerificationDataModel.find({ email: emailEntered });
        if (check.length && check[0].verified == "yes") {
            console.log("userSignUp : User signing up with email:", emailEntered);
            const { Name, password } = req.body;
            const userData = {
                Name,
                email:emailEntered,
                password
            };
            if (req.file) {
                userData.profileImage = req.file.path;
                userData.imagePublicId = req.file.filename;
                console.log("userSignUp : User uploaded a profile image");
            }
            await usersDataModel.create(userData);
            res.redirect('/');
            return;
        }
        else {
            throw new Error("Something went wrong...");
            res.redirect('/');
            return;
        }
    }


    catch (error) {
        console.log("userSignUp : Error", error);
        if (error.message.startsWith("E11000")) {
            error.message = "Already registered with this email";
        }

        errorLog(error, req);
        res.render("signup", { error, email: req.params.emailEntered });
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

async function verifyEmail(req, res) {
    console.log("req.body :", req.body);
    const email = req.body.email;
    const check = await emailVerificationDataModel.find({ email });
    console.log("check :", check);
    console.log("check.length :", check.length);
    if (check.length) {
        if (check[0].verified == "yes") {
            const error = new Error("Already registered with this email")
            console.log("Already registered")
            res.render("verifyEmail", {error});
            console.log("again verifyEmail rendered");
            return;
        }
        else {
            const otp = generateOTP();
            const expireTime = Date.now() + 10 * 60 * 1000;  //10 Minutes from otp
            await emailVerificationDataModel.updateOne({ email }, { $set: { otp, expireTime } });
            try {
                await sendOTP(email, otp);
                console.log("OTP sent successfully...");
                res.render("verifyOtp", {email});
                console.log("verifyOtp Rendered");
                return;
            }
            catch (error) {
                console.log("Error in sending otp  :",error)
                res.render("verifyEmail",{ error});
                console.log("again verifyEmail rendered");
                return;
            }
        }
    }
    else {
        console.log("First time came to the portal");
        const otp = generateOTP();
        const expireTime = Date.now() + 10 * 60 * 1000;  //10 Minutes from otp
        await emailVerificationDataModel.create({ email, otp, expireTime });
        try {
            await sendOTP(email, otp);
            console.log("OTP sent successfully...");
            res.render("verifyOtp", {email});
            console.log("verifyOtp Rendered");
            return;
        }
        catch (error) {
            console.log("Error in sending otp :",error)
            res.render("verifyEmail", {error});
            console.log("again verifyEmail rendered");
            return;
        }
    }
}

async function verifyOtp(req, res) {
    const emailEntered = req.params.emailEntered;
    const otpEntered = req.body.otp;
    const emailData = await emailVerificationDataModel.find({ email: emailEntered });
    const currentDate = Date.now();
    if (emailData[0].otp == otpEntered && currentDate <= emailData[0].expireTime) {
        await emailVerificationDataModel.updateOne({ email: emailEntered }, { $set: { verified: "yes" } });
        res.render("signup", {
            email: emailEntered
        });
        return;
    }
    else {
        const error = new Error("OTP mismatch or Time expired , Again do Verfication");
        res.render("verifyEmail", {error});
        return;
    }
}

module.exports = {
    userSignUp,
    userLogIn,
    userLogout,
    provideCustomizedAuthor,
    verifyEmail,
    verifyOtp
};
