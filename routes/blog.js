const express=require('express');
const multer=require('multer');
const path=require("path");
const {addBlog,provideBlogBody} = require('../controllers/blog');
const blogRouter=express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,"..","/public/uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload=multer({storage:storage});

blogRouter.get('/addBlog',(req,res)=>res.render("addBlog"));
blogRouter.post('/',upload.single("coverImageUrl"),addBlog);
blogRouter.get('/:ID',provideBlogBody);

module.exports=blogRouter;