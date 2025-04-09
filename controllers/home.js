const blogsDataModel = require("../models/blogsData");

async function provideHomePage(req,res){
    console.log(req.user);
    const blogsData=await blogsDataModel.find({}).sort({createdAt:-1});
    req.blogsData=null;
    if(blogsData && blogsData.length)
        req.blogsData=blogsData;
    if(req.user)
    return res.render("home",{
        blogsData:req.blogsData,
        user:req.user
    });

    res.render("home",{blogsData:req.blogsData});
}


module.exports=provideHomePage;