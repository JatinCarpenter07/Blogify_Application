const mongoose=require('mongoose');

const commentsDataSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    relatedBlog:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blogsData",
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
},
{
    timestamps:true,
    strict:false
});

const commentsDataModel=mongoose.model("commentsData",commentsDataSchema,"commentsData");

module.exports=commentsDataModel;