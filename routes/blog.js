const express = require('express');
const multer = require('multer');
const path = require("path");
const {
    addBlog,
    provideBlogBody,
    addTheComments,
    changeBlog,
    editComment,
    deleteTheBlog,
    deleteTheComment
} = require('../controllers/blog');

const blogRouter = express.Router();

const {storage} =require("../services/cloudinary");

const upload = multer({ storage: storage });

blogRouter.get('/addBlog', (req, res) => {
    console.log("Rendering addBlog page...");
    res.render("addBlog", { user: req.user });
});

blogRouter.post('/:ID/comments', (req, res) => {
    console.log(`Adding comment to blog ID: ${req.params.ID}...`);
    addTheComments(req, res);
});

blogRouter.get('/:ID/edit', (req, res) => {
    console.log(`Rendering editBlog page for blog ID: ${req.params.ID}...`);
    res.render("editBlog", { blogId: req.params.ID, user: req.user });
});

blogRouter.post('/:ID/edit', upload.single("coverImageUrl"), (req, res) => {
    console.log(`Editing blog with ID: ${req.params.ID}...`);
    changeBlog(req, res);
});

blogRouter.get('/:ID/delete', (req, res) => {
    console.log(`Deleting blog with ID: ${req.params.ID}...`);
    deleteTheBlog(req, res);
});

blogRouter.get('/:ID', (req, res) => {
    console.log(`Providing blog body for blog ID: ${req.params.ID}...`);
    provideBlogBody(req, res);
});

blogRouter.get('/:ID/:commID/deleteComments', (req, res) => {
    console.log(`Deleting comment ID: ${req.params.commID} from blog ID: ${req.params.ID}...`);
    deleteTheComment(req, res);
});

blogRouter.get('/:ID/:commID/editComments', (req, res) => {
    console.log(`Rendering editComment page for comment ID: ${req.params.commID} on blog ID: ${req.params.ID}...`);
    res.render("editComment", { blogId: req.params.ID, commentId: req.params.commID, user: req.user });
});

blogRouter.post('/:ID/:commID/editComments', (req, res) => {
    console.log(`Editing comment ID: ${req.params.commID} on blog ID: ${req.params.ID}...`);
    editComment(req, res);
}); 

blogRouter.post('/', upload.single("coverImageUrl"), (req, res) => {
    console.log("post/blog : Adding new blog...");
    addBlog(req, res);
});

module.exports = { blogRouter, upload };
