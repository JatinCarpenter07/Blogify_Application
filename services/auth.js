const jwt=require('jsonwebtoken');
const secretKey="J!a@t#i$n%@^1&3*2(5"

function builtTheToken(user){
    console.log("Building token for user:", user._id);

    const plainObject={
        _id:user._id,   //user[0]._id isi me kuchh dikkat hai  ObjectId 
        Name:user.Name,
        email:user.email,
        profileImage:user.profileImage,
        role:user.role,
        imagePublicId:user.imagePublicId
    };

    const token = jwt.sign(plainObject, secretKey);
    console.log("Token built successfully");
    return token;
}

function decodeTheToken(token){
    console.log("Decoding token...");
    if(!token) {
        console.log("No token provided");
        return null;
    }

    try{
        const decoded = jwt.verify(token, secretKey);
        console.log("Token decoded successfully");
        return decoded;
    }
    catch(error){
        console.log("Token decoding failed:", error.message);
        return null;
    }
}

module.exports={
    builtTheToken,
    decodeTheToken
}
