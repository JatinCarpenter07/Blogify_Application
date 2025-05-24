const express = require('express');
const {
    provideHomePage,
    provideSearchPage,
    provideAllBlogs,
    provideAllAuthors
} = require('../controllers/home');

const homeRouter = express.Router();

homeRouter.get('/', (req, res) => {
    console.log("Accessing Home Page...");
    provideHomePage(req, res);
});

homeRouter.get('/search', (req, res) => {
    console.log("Accessing Search Page...");
    provideSearchPage(req, res);
});

homeRouter.get('/allBlogs', (req, res) => {
    console.log("Accessing All Blogs Page...");
    provideAllBlogs(req, res);
});

homeRouter.get('/allAuthors', (req, res) => {
    console.log("Accessing All Authors Page...");
    provideAllAuthors(req, res);
});

homeRouter.get('/about', (req, res) => {
    console.log("Accessing About Page...");
    req.session.previousUrl=req.originalUrl;
    return res.render("about",{user:req.user});
});

module.exports = homeRouter;
