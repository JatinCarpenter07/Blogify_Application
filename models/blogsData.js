const mongoose=require('mongoose');

const blogsDataSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    body:{
        type:String,
        default:" ",
    },
    coverImageUrl:{
        type:String,
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

const blogsDataModel=mongoose.model("blogsData",blogsDataSchema,"blogsData");

module.exports=blogsDataModel;