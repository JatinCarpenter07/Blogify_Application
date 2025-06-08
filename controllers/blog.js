const path = require('path');
const blogsDataModel = require('../models/blogsData');
const commentsDataModel = require('../models/commentsData');
const usersDataModel = require('../models/usersData');
const fs = require('fs');
const { errorLog } = require('../middlewares');
const { cloudinary } = require('../services/cloudinary');

async function addBlog(req, res) {
    try {
        console.log("addBlog : Checking if user is logged in");
        if (!req.user) {
            req.session.previousUrl = "/blog/addblog";
            console.log("addBlog : User not logged in, redirecting to login");
            res.redirect(302, "/user/login");
            return;
        }
        console.log("Req.body :", req.body);
        console.log("Req.file :", req.file);
        console.log("addBlog : Creating a new blog");
        const newBlog = await blogsDataModel.create({
            title: req.body.title,
            description: req.body.description,
            body: req.body.body,
            coverImageUrl: req.file.path,
            imagePublicId: req.file.filename,
            createdBy: req.user._id
        });
        await usersDataModel.updateOne({ _id: req.user._id }, { $inc: { count: 1 } });
        let user = await usersDataModel.find({ _id: req.user._id });
        user = user[0];
        if (user.count > 0) {
            console.log("addBlog : Updating user role");
            if (user.role === 'viewer')
                await usersDataModel.updateOne({ _id: user._id }, { $set: { role: "author" } });
            else if (user.role === 'admin')
                await usersDataModel.updateOne({ _id: user._id }, { $set: { role: "adminAuthor" } });
        }
        console.log("addBlog : Redirecting to newly created blog");
        res.redirect(`/blog/${newBlog._id}`);
    }
    catch (error) {
        console.log("addBlog : Error", error);
        errorLog(error, req);
        res.render("addBlog", {
            error: error,
            user: req.user
        });
        return;
    }
}

async function provideBlogBody(req, res) {
    try {
        console.log("provideBlogBody : Fetching blog by ID", req.params.ID);
        const _id = req.params.ID;
        const blog = await blogsDataModel.find({ _id }).populate("createdBy");
        if (!blog || !blog.length) {
            console.log("provideBlogBody : Blog not found, redirecting to homepage");
            return res.redirect(302, "/");
        }
        const author = blog[0].createdBy;

        console.log("provideBlogBody : Fetching comments for the blog");
        const comments = await commentsDataModel.find({ relatedBlog: _id }).populate("createdBy").sort({ createdAt: -1 });
        req.session.previousUrl = req.originalUrl;

        console.log("provideBlogBody : Rendering blog page");
        return res.render("blog", {
            blog: blog[0],
            author: author,
            user: req.user,
            comments: comments
        })
    }
    catch (error) {
        console.log("provideBlogBody : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function addTheComments(req, res) {
    try {
        console.log("addTheComments : Checking if user is logged in");
        if (!req.user) {
            console.log("addTheComments : User not logged in, redirecting to login");
            res.redirect(302, "/user/login");
            return;
        }
        const blogId = req.params.ID;
        console.log("addTheComments : Adding new comment to blog ID", blogId);
        await commentsDataModel.create({
            content: req.body.commentText,
            relatedBlog: blogId,
            createdBy: req.user._id
        });
        res.redirect(302, `/blog/${blogId}`);
    }
    catch (error) {
        console.log("addTheComments : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function changeBlog(req, res) {
    try {
        console.log("changeBlog : Checking if user is logged in");
        if (!req.user) {
            req.session.previousUrl = req.originalUrl;
            console.log("changeBlog : User not logged in, redirecting to login");
            res.redirect(302, "/user/login");
            return;
        }
        const _id = req.params.ID;
        console.log("changeBlog : Fetching blog by ID", _id);
        const blog = await blogsDataModel.find({ _id }).populate("createdBy");
        if (!blog.length || req.user._id.toString() !== blog[0].createdBy._id.toString()) {
            console.log("changeBlog : User is not the creator of the blog, redirecting to homepage");
            return res.redirect("/");
        }
        console.log("blog[0] :", blog[0]);
        let imagePublicId = blog[0].imagePublicId;
        if (imagePublicId) {
            console.log("changeTheBlog : Deleting blog previous cover image at", imagePublicId);
            try {

                await cloudinary.uploader.destroy(imagePublicId);
                console.log("Deleted cover old cover Image");

            }
            catch (error) {
                console.log("changeTheBlog : Error deleting previous coverImage", error);
                errorLog(error, req);
            }
        }
        console.log("changeBlog : Updating blog with new data");
        await blogsDataModel.updateOne({ _id }, {
            $set: {
                title: req.body.title,
                description: req.body.description,
                body: req.body.body,
                coverImageUrl: req.file.path,
                imagePublicId: req.file.filename,
            }
        })
        res.redirect(302, `/blog/${_id}`);
    }
    catch (error) {
        console.log("changeBlog : Error", error);
        errorLog(error, req);
        res.render("editBlog", { blogId: req.params.ID, user: req.user, error: error });
    }
}

async function editComment(req, res) {
    try {
        console.log("editComment : Checking if user is logged in");
        if (!req.user) {
            req.session.previousUrl = req.originalUrl;
            console.log("editComment : User not logged in, redirecting to login");
            res.redirect(302, "/user/login");
            return;
        }
        const blogId = req.params.ID;
        const commentId = req.params.commID;
        console.log("editComment : Fetching comment by ID", commentId);
        const comment = await commentsDataModel.find({ _id: commentId }).populate("createdBy");
        if (!comment.length || req.user._id.toString() !== comment[0].createdBy._id.toString()) {
            console.log("editComment : User is not the creator of the comment, redirecting to homepage");
            return res.redirect("/");
        }
        console.log("editComment : Updating comment with new content");
        await commentsDataModel.updateOne({ _id: commentId }, {
            $set: {
                content: req.body.commentText
            }
        })
        if (req.session.previousUrl)
            return res.redirect(302, req.session.previousUrl);

        res.redirect(302, `/blog/${blogId}`);
    }
    catch (error) {
        console.log("editComment : Error", error);
        errorLog(error, req);
        res.render("editComment", {
            blogId: req.params.ID,
            commentId: req.params.commID,
            user: req.user,
            error: error
        })
    }
}

async function deleteTheBlog(req, res) {
    try {
        console.log("deleteTheBlog : Checking if user is logged in");
        if (!req.user) {
            req.session.previousUrl = req.originalUrl;
            console.log("deleteTheBlog : User not logged in, redirecting to login");
            res.redirect(302, "/user/login");
            return;
        }
        const _id = req.params.ID;
        console.log("deleteTheBlog : Fetching blog by ID", _id);
        const blog = await blogsDataModel.find({ _id }).populate("createdBy");
        if (!blog.length || req.user._id.toString() !== blog[0].createdBy._id.toString()) {
            console.log("deleteTheBlog : User is not the creator of the blog, redirecting to homepage");
            return res.redirect("/");
        }
        let imagePublicId = blog[0].imagePublicId;
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
        await usersDataModel.updateOne({ _id: blog[0].createdBy._id }, { $inc: { count: -1 } });
        let user = await usersDataModel.find({ _id: blog[0].createdBy._id });
        user = user[0];
        if (user.count <= 0) {
            console.log("deleteTheBlog : Updating user role due to count");
            if (user.role === 'author')
                await usersDataModel.updateOne({ _id: user._id }, { $set: { role: "viewer" } });
            else if (user.role === 'adminAuthor')
                await usersDataModel.updateOne({ _id: user._id }, { $set: { role: "admin" } });
        }
        console.log("deleteTheBlog : Deleting associated comments and blog");
        await commentsDataModel.deleteMany({ relatedBlog: _id });
        await blogsDataModel.deleteOne({ _id });
        if (req.session.previousUrl)
            return res.redirect(302, req.session.previousUrl);
        res.redirect("/");
    }
    catch (error) {
        console.log("deleteTheBlog : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function deleteTheComment(req, res) {
    try {
        console.log("deleteTheComment : Checking if user is logged in");
        if (!req.user) {
            req.session.previousUrl = req.originalUrl;
            console.log("deleteTheComment : User not logged in, redirecting to login");
            res.redirect(302, "/user/login");
            return;
        }
        const _id = req.params.commID;
        console.log("deleteTheComment : Fetching comment by ID", _id);
        const comment = await commentsDataModel.find({ _id }).populate("createdBy");
        if (!comment.length || req.user._id.toString() !== comment[0].createdBy._id.toString()) {
            console.log("deleteTheComment : User is not the creator of the comment, redirecting to homepage");
            return res.redirect("/");
        }
        console.log("deleteTheComment : Deleting comment with ID", _id);
        await commentsDataModel.deleteOne({ _id });
        if (req.session.previousUrl) {
            console.log("deleteTheComment : Redirecting to previous URL");
            return res.redirect(302, req.session.previousUrl);
        }
        res.redirect("/");
    }
    catch (error) {
        console.log("deleteTheComment : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

module.exports = { addBlog, provideBlogBody, addTheComments, changeBlog, editComment, deleteTheBlog, deleteTheComment };
