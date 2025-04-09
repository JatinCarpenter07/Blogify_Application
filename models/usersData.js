const { createHmac, randomBytes}=require("crypto");        //built in package
const mongoose=require('mongoose');
const { builtTheToken } = require("../services/auth");

const usersDataSchemma=new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["READER","AUTHOR","ADMIN"],
        default:"READER"
    },
    profileImage:{
        type:String,
        default:'/images/defaultProfile.png'
    }
},{
    timestamps:true,
    strict:false
},)

usersDataSchemma.pre("save",function(next){   //run before the data going to save  , its a middlware and have access to the info which is going to store (use this.)
    const user  =this;
    if(!user.isModified("password")) return next();
    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac("sha256",salt).update(user.password).digest("hex");  //to store the password as encrypted 
    
    this.password=hashedPassword;
    this.salt=salt;

    next();
})

usersDataSchemma.static("matchPasswordAndGenerateToken",async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found! Not Registered Email");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash)
      throw new Error("Incorrect Password");

    const token =builtTheToken(user);
    return token;
  }
);



const usersDataModel=mongoose.model("users",usersDataSchemma,"usersData");
module.exports=usersDataModel;