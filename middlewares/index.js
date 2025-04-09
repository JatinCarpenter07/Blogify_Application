const fs = require('fs');
const {decodeTheToken}=require('../services/auth');

function logTheRequest(req, res, next) {
    fs.appendFile("log.txt", `Time : ${Date.now()} || Method : ${req.method} || Path : ${req.path}\n`,
        (err, data) => {
            next();
        }
    );
}

function invalidRequest(req, res) {
    return res.status(404).send("Invalid Path : Resource not Found")
}

function checkForAuthentication(req,res,next){
    req.user=null;
    let cookieValue=req.cookies?.sessionId;
    if(!cookieValue)
        return next();
    const user=decodeTheToken(cookieValue);
    if(!user)
        return next();
    console.log(user);
    req.user=user;
    return next();
}

function restrictToRoles(roles){   //used as closure bcoz taking a extra parameter in the middleware
    return (req,res,next)=>{
        if(!req.user)
            return res.redirect('/login');
        if(!roles.includes(req.user.role)){
            return res.json({
                message:`You are not a ${roles} & have no access to this Section...`
            })
        }
        return next();
    }
}

module.exports = { logTheRequest, invalidRequest,checkForAuthentication,restrictToRoles};