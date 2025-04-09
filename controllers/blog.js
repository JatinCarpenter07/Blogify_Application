const blogsDataModel=require('../models/blogsData');
const usersDataModel = require('../models/usersData');

async function addBlog(req,res){
    console.log("req.file",req.file);
    await blogsDataModel.create({
        title:req.body.title,
        description:req.body.description,
        body:req.body.body,
        coverImageUrl:`uploads/${req.file.filename}`,
        createdBy:req.user._id
    });
    res.redirect('/');
}

async function provideBlogBody(req,res){
    const _id=req.params.ID;
    const blog=await blogsDataModel.find({_id}).populate("createdBy");
    if(!blog || !blog.length)
        return res.render("blog",{error:"No Blog Descriptions Found"});
    console.log("blog",blog);
    const author=blog[0].createdBy;
    return res.render("blog",{
        blog:blog[0],
        author:author,
        user:req.user
    })
}

module.exports={addBlog,provideBlogBody};