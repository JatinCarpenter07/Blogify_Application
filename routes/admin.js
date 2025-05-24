const express=require('express');
const { provideDashBlogs, provideDashComments, provideDashUsers, makeAdmin, removeAdmin, provideProfile, removeUser } = require('../controllers/admin');
const adminRouter=express.Router();

adminRouter.get('/makeAdmin/:ID', (req, res) => {
    console.log(`Making user with ID ${req.params.ID} an admin...`);
    makeAdmin(req, res);
});
adminRouter.get('/removeAdmin/:ID', (req, res) => {
    console.log(`Removing admin rights from user with ID ${req.params.ID}...`);
    removeAdmin(req, res);
});
adminRouter.get('/removeUser/:ID', (req, res) => {
    console.log(`Removing user with ID ${req.params.ID}...`);
    removeUser(req, res);
});
adminRouter.get('/profile/:ID', (req, res) => {
    console.log(`Providing profile for user with ID ${req.params.ID}...`);
    provideProfile(req, res);
});
adminRouter.get('/dashboard', (req, res) => {
    console.log("Rendering dashboard...");
    res.render("dashboard", { user: req.user });
});
adminRouter.get('/dashboard/blogs', (req, res) => {
    console.log("Providing dashboard blogs...");
    provideDashBlogs(req, res);
});
adminRouter.get('/dashboard/comments', (req, res) => {
    console.log("Providing dashboard comments...");
    provideDashComments(req, res);
});
adminRouter.get('/dashboard/users', (req, res) => {
    console.log("Providing dashboard users...");
    provideDashUsers(req, res);
});

module.exports=adminRouter;
