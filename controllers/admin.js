const blogsDataModel = require("../models/blogsData");
const commentsDataModel = require("../models/commentsData");
const usersDataModel = require("../models/usersData");
const path = require('path');
const fs = require('fs');
const { errorLog } = require("../middlewares");

async function provideDashBlogs(req, res) {
    try {
        console.log("provideDashBlogs : Fetching all blogs");
        const blogs = await blogsDataModel.find().populate("createdBy");
        req.session.previousUrl = req.originalUrl;
        console.log("provideDashBlogs : Rendering dashBlogs with fetched data");
        return res.render("dashBlogs", {
            user: req.user,
            blogs: blogs
        });
    }
    catch (error) {
        console.log("provideDashBlogs : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function provideDashComments(req, res) {
    try {
        console.log("provideDashComments : Fetching all comments");
        const comments = await commentsDataModel.find().populate("relatedBlog").populate("createdBy");
        req.session.previousUrl = req.originalUrl;
        console.log("provideDashComments : Rendering dashComments with fetched data");
        return res.render("dashComments", {
            user: req.user,
            comments: comments
        });
    }
    catch (error) {
        console.log("provideDashComments : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function provideDashUsers(req, res) {
    try {
        console.log("provideDashUsers : Fetching all users");
        const users = await usersDataModel.find();
        req.session.previousUrl = req.originalUrl;
        console.log("provideDashUsers : Rendering dashUser with fetched data");
        return res.render("dashUser", {
            user: req.user,
            users: users
        });
    }
    catch (error) {
        console.log("provideDashUsers : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function makeAdmin(req, res) {
    try {
        console.log("makeAdmin : Changing user role to admin");
        const _id = req.params.ID;
        const user = await usersDataModel.find({ _id });
        if (user[0].role == "author")
            await usersDataModel.updateOne({ _id }, { $set: { role: "adminAuthor" } });
        else
            await usersDataModel.updateOne({ _id }, { $set: { role: "admin" } });
        if (req.session.previousUrl) {
            console.log("makeAdmin : Redirecting to previous URL");
            return res.redirect(302, req.session.previousUrl);
        }
        res.redirect('/');
    }
    catch (error) {
        console.log("makeAdmin : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function removeAdmin(req, res) {
    try {
        console.log("removeAdmin : Checking if last admin role exists");
        const count = await usersDataModel.countDocuments({ role: { $in: ["admin", "adminAuthor"] } });
        if (count <= 1) {
            console.log("removeAdmin : Cannot remove last admin");
            return res.redirect("/admin/dashboard/users");
        }
        const _id = req.params.ID;
        const user = await usersDataModel.find({ _id });
        if (user[0].count > 0)
            await usersDataModel.updateOne({ _id }, { $set: { role: "author" } });
        else
            await usersDataModel.updateOne({ _id }, { $set: { role: "viewer" } });
        
        if (_id == req.user._id)
            return res.redirect('/');
        if (req.session.previousUrl) {
            console.log("removeAdmin : Redirecting to previous URL");
            return res.redirect(302, req.session.previousUrl);
        }
        res.redirect('/');
    }
    catch (error) {
        console.log("removeAdmin : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function provideProfile(req, res) {
    try {
        console.log("provideProfile : Fetching user profile for ID", req.params.ID);
        const _id = req.params.ID;
        const userProfile = await usersDataModel.find({ _id });
        if (userProfile.length) {
            console.log("provideProfile : Rendering adminProfile with user data");
            return res.render("adminProfile", {
                user: req.user,
                userProfile: userProfile[0]
            });
        }

        res.redirect('/');
    }
    catch (error) {
        console.log("provideProfile : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function removeUser(req, res) {
    try {
        console.log("removeUser : Removing user with ID", req.params.ID);
        const _id = req.params.ID;
        const user = await usersDataModel.find({ _id });
        const count = await usersDataModel.countDocuments({ role: { $in: ["admin", "adminAuthor"] } });
        if ((user[0].role == "admin" || user[0].role == "adminAuthor") && count <= 1) {
            console.log("removeUser : Cannot remove last admin");
            return res.redirect("/admin/dashboard/users");
        }
        const blogs = await blogsDataModel.find({ createdBy: _id });
        blogs.forEach(blog => {
            const imagePath = path.join(__dirname, "../public", blog.coverImageUrl);
            console.log("removeUser : Deleting blog image at", imagePath);
            fs.unlinkSync(imagePath);
        });
        await blogsDataModel.deleteMany({ createdBy: _id });
        await commentsDataModel.deleteMany({ createdBy: _id });
        const profilePath = path.join(__dirname, "../public", user[0].profileImage);
        try {
            console.log("removeUser : Deleting profile image at", profilePath);
            fs.unlinkSync(profilePath);
        }
        catch (error) {
            errorLog(error, req);
        }
        await usersDataModel.deleteOne({ _id });
        if (user[0]._id == req.user._id)
            return res.redirect("/user/logout");

        if (req.session.previousUrl)
            return res.redirect(req.session.previousUrl);

        return res.redirect('/');
    }
    catch (error) {
        console.log("removeUser : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

module.exports = { provideDashBlogs, provideDashComments, provideDashUsers, makeAdmin, removeAdmin, provideProfile, removeUser };
