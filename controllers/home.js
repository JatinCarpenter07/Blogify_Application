const { errorLog } = require("../middlewares");
const blogsDataModel = require("../models/blogsData");
const usersDataModel = require("../models/usersData");

async function provideHomePage(req, res) {
    try {
        console.log("provideHomePage : Fetching blogs data");
        const blogsData = await blogsDataModel.find({}).populate("createdBy").sort({ createdAt: -1 }).limit(6);
        req.blogsData = null;
        if (blogsData && blogsData.length)
            req.blogsData = blogsData;

        console.log("provideHomePage : Fetching authors data");
        const authors = await usersDataModel.find({ count: { $gt: 0 } }).sort({ count: -1 }).limit(6);
        
        console.log("provideHomePage : Rendering home page with blogs and authors");
        return res.render("home", {
            blogsData: req.blogsData,
            user: req.user,
            popularAuthors: authors
        });
    }
    catch (error) {
        console.log("provideHomePage : Error", error);
        errorLog(error, req);
    }
}

async function provideSearchPage(req, res) {
    try {
        console.log("provideSearchPage : Searching for query", req.query.query);
        const query = req.query.query;
        const searchBlogs = await blogsDataModel.find({ $text: { $search: query } }).sort({ score: { $meta: "textScore" } });
        const searchAuthors = await usersDataModel.find({ $text: { $search: query }, count: { $gt: 0 } }).sort({ score: { $meta: "textScore" } });

        console.log("provideSearchPage : Rendering search page with results");
        return res.render("searchPage", {
            searchQuery: query,
            matchedBlogs: searchBlogs,
            matchedAuthors: searchAuthors,
            user: req.user,
        });
    }
    catch (error) {
        console.log("provideSearchPage : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function provideAllBlogs(req, res) {
    try {
        console.log("provideAllBlogs : Fetching all blogs data");
        const blogs = await blogsDataModel.find().populate("createdBy");

        console.log("provideAllBlogs : Rendering all blogs page");
        return res.render("allBlogs", {
            blogsData: blogs,
            user: req.user,
        });
    }
    catch (error) {
        console.log("provideAllBlogs : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

async function provideAllAuthors(req, res) {
    try {
        console.log("provideAllAuthors : Fetching all authors data");
        const authors = await usersDataModel.find({ count: { $gt: 0 } });

        console.log("provideAllAuthors : Rendering all authors page");
        return res.render("allAuthors", {
            authorsData: authors,
            user: req.user,
        });
    }
    catch (error) {
        console.log("provideAllAuthors : Error", error);
        errorLog(error, req);
        res.redirect("/");
    }
}

module.exports = { provideHomePage, provideSearchPage, provideAllAuthors, provideAllBlogs };
