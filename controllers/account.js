const blogsDataModel = require('../models/blogsData');
const commentsDataModel = require('../models/commentsData');
const usersDataModel = require('../models/usersData');
const path = require('path');
const fs = require('fs');
const { errorLog } = require('../middlewares');
const { cloudinary } = require('../services/cloudinary');


async function provideTheAccountPage(req, res) {
    try {
        if (!req.user) {
            console.log("provideTheAccountPage : No LogIn");
            req.session.previousUrl = req.originalUrl;
            res.redirect(302, "/user/login");
            return;
        }
        const allBlogs = await blogsDataModel.find({ createdBy: req.user._id });
        const allComments = await commentsDataModel.find({ createdBy: req.user._id }).populate("relatedBlog");
        req.session.previousUrl = req.originalUrl;
        res.render("account", {
            user: req.user,
            myBlogs: allBlogs,
            myComments: allComments
        });
        console.log("provideTheAccountPage : Successfully.");
    }
    catch (error) {
        console.log("provideTheAccountPage : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}


async function editProfile(req, res) {
    try {
        if (!req.user) {
            console.log("editProfile : No LogIn");
            req.session.previousUrl = req.originalUrl;
            res.redirect(302, "/user/login");
            return;
        }
        const { Name, email, password } = req.body;
        if (req.file) {
            console.log("editProfile : File uploaded, updating profile with image.");
            const imagePublicId = req.user.imagePublicId;
            if (imagePublicId) {
                try {
                    console.log("editProfile : Deleting previous profile image at", imagePublicId);
                    await cloudinary.uploader.destroy(imagePublicId);
                    console.log("Old profile deleted successfully.")
                }
                catch (error) {
                    errorLog(error, req);
                }
            }
            await usersDataModel.updateOne({ _id: req.user._id }, {
                $set: {
                    Name: Name,
                    email: email,
                    password: password,
                    profileImage: req.file.path,
                    imagePublicId: req.file.filename
                }
            });
        }
        else {
            console.log("editProfile : No file uploaded, updating profile without image.");
            await usersDataModel.updateOne({ _id: req.user._id }, {
                $set: {
                    Name: Name,
                    email: email,
                    password: password,
                }
            });
        }

        console.log("editProfile : Successfully.");
        res.redirect(302, '/account/profile');
    }
    catch (error) {
        errorLog(error, req);
        console.log("editProfile : Error", error);
        res.render("editProfile", {
            user: req.user,
            error: error
        });
    }
}

async function deleteProfile(req, res) {
    try {
        if (!req.user) {
            console.log("deleteProfile : No LogIn");
            req.session.previousUrl = req.originalUrl;
            res.redirect(302, "/user/login");
            return;
        }
        const _id = req.user._id;
        const blogs = await blogsDataModel.find({ createdBy: _id });
        console.log("deleteProfile : Found blogs to delete for user", _id);
        blogs.forEach(async (blog) => {
            let imagePublicId = blog.imagePublicId;
            if (imagePublicId) {
                console.log("changeTheBlog : Deleting blog previous cover image at", imagePublicId);
                try {
                    await cloudinary.uploader.destroy(imagePublicId);
                    console.log("Deleted cover Image");

                }
                catch (error) {
                    console.log("deleteTheBlog : Error deleting image", error);
                    errorLog(error, req);
                }
            }
            await commentsDataModel.deleteMany({ relatedBlog: blog._id });
        });
        await blogsDataModel.deleteMany({ createdBy: _id });
        console.log("deleteProfile : Deleted blogs for user", _id);
        await commentsDataModel.deleteMany({ createdBy: _id });
        console.log("deleteProfile : Deleted comments for user", _id);
        const imagePublicId = req.user.imagePublicId;
        if (imagePublicId) {
            try {
                console.log("editProfile : Deleting previous profile image at", imagePublicId);
                await cloudinary.uploader.destroy(imagePublicId);
                console.log("Old profile deleted successfully.")
            }
            catch (error) {
                errorLog(error, req);
            }
        }
        await usersDataModel.deleteOne({ _id });
        console.log("deleteProfile : Successfully deleted user profile.");
        res.redirect("/user/logout");
    }
    catch (error) {
        errorLog(error, req);
        console.log("deleteProfile : Error", error);
        res.redirect("/");
    }
}

module.exports = { provideTheAccountPage, editProfile, deleteProfile };
