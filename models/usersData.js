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
    count:{
        type:Number,
        default:0
    },
    role: {
        type: String,
        enum: ['viewer', 'author', 'admin','adminAuthor'],
        default: 'viewer'
    },
    profileImage:{
        type:String,
        default:'/images/defaultProfile.png'
    },
    imagePublicId:{
        type:String,
    }
},{
    timestamps:true,
    strict:false
},)

usersDataSchemma.pre("save",function(next){   //run before the data going to save  , its a middlware and have access to the info which is going to store (use "this.")
    const user  =this;
    console.log("Pre save middleware triggered");

    if(!user.isModified("password")) return next();
    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac("sha256",salt).update(user.password).digest("hex");  //to store the password as encrypted 
    
    this.password=hashedPassword;
    this.salt=salt;

    console.log("Password encrypted and saved");
    next();
})

usersDataSchemma.pre("updateOne", function (next) {
    console.log("Pre updateOne middleware triggered");
    let update = this.getUpdate();

    if (update.$set && update.$set.password) {
        const salt = randomBytes(16).toString();
        const hashedPassword = createHmac("sha256", salt)
            .update(update.$set.password)
            .digest("hex");

        update.$set.password = hashedPassword;
        update.$set.salt = salt;
        console.log("Password encrypted during update");
    } else if (update.password) {
        // In case password is not under $set
        const salt = randomBytes(16).toString();
        const hashedPassword = createHmac("sha256", salt)
            .update(update.password)
            .digest("hex");

        update.password = hashedPassword;
        update.salt = salt;
        console.log("Password encrypted during update");
    }

    next();
});

usersDataSchemma.static("matchPasswordAndGenerateToken",async function (email, password) {
    console.log(`Matching password for user with email: ${email}`);
    const user = await this.findOne({ email });
    if (!user) {
        console.log("User not found!");
        throw new Error("User not found! Not Registered Email");
    }

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash) {
        console.log("Incorrect password");
        throw new Error("Incorrect Password");
    }

    const token = builtTheToken(user);
    console.log("Token generated for user");
    return token;
});

const usersDataModel=mongoose.model("users",usersDataSchemma,"usersData");
module.exports=usersDataModel;
