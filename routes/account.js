const express=require('express');
const accountRouter=express.Router();
const {upload}=require('./blog');
const { provideTheAccountPage, editProfile, deleteProfile } = require('../controllers/account');

function mustBeLoggedIn(req,res,next){
    console.log("Checking if user is logged in...");
    if (!req.user) {
        req.session.previousUrl=req.originalUrl;
        console.log("User not logged in. Redirecting to login page...");
        res.redirect(302, "/user/login");
        res.end();
        return;
    }
    else {
        console.log("User is logged in. Proceeding...");
        next();
    }
}

accountRouter.use(mustBeLoggedIn);

accountRouter.get('/', provideTheAccountPage);
console.log("Account page route setup.");
accountRouter.get('/profile', (req, res) => {
    console.log("Rendering profile page...");
    res.render("profile", { user: req.user });
});
accountRouter.get('/profile/edit', (req, res) => {
    console.log("Rendering edit profile page...");
    res.render("editProfile", { user: req.user });
});
accountRouter.post('/profile/edit', upload.single("profileImage"), editProfile);
console.log("Edit profile post route setup.");
accountRouter.get('/profile/delete', deleteProfile);
console.log("Delete profile route setup.");

module.exports = accountRouter;
