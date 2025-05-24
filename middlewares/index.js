const fs = require('fs');
const {decodeTheToken}=require('../services/auth');
const usersDataModel = require('../models/usersData');
const { stringify } = require('querystring');

function logTheRequest(req, res, next) {
    const logData ={
        Time: new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }),
        IP: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
        User: req.user?.Name || "Guest",
        Path: req.originalUrl,
        Method: req.method,
    };
    
    const formattedLog = JSON.stringify(logData, null, 2) + '\n\n';

    fs.appendFile("log.txt",formattedLog,
        (err, data) => {
            console.log("Http req. Logged successfully.");
            next();
        }
    );
}

function errorLog(error,req){
    const errorData ={
        Time: new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }),
        Error: {
            name:error.name,
            message: error.message,
            stack: error.stack,
        },
        IP: req?.headers['x-forwarded-for']?.split(',')[0] || req?.socket.remoteAddress || "None",
        User: req?.user?.Name || "Guest",
        Path: req?.originalUrl || "None",
        Method: req?.method || "None",
    };
    
    const formattedLog = JSON.stringify(errorData, null, 2) + '\n\n';

    fs.appendFile("error.txt",formattedLog,
        (err, data) => {
            console.log("Error logged successfully");
        }
    );
}

function provideNewLine(req, res, next) {
    res.on('finish', () => {
        console.log();
    });
    next();
}

function invalidRequest(req, res) {
    console.log("Its an Invalid Request.");
    return res.render("invalidRequest");
}

async function checkForAuthentication (req,res,next){
    req.user=null;
    let cookieValue=req.cookies?.sessionId;
    if(!cookieValue){
        console.log("Authentication : No cookie");
        return next();
    }
    let user=decodeTheToken(cookieValue);
    if(!user){
        console.log("Authentication : No valid User.");
        return next();
    }
    user=await usersDataModel.find({_id:user._id});
    req.user=user[0];
    console.log("Authentication : Done successfully");
    return next();
}

function restrictToRoles(roles){   //used as closure bcoz taking a extra parameter in the middleware
    return (req,res,next)=>{
        if(!req.user){
            console.log("Authorization : No LogIn");
            return res.redirect('/user/login');
        }
        if(!roles.includes(req.user.role)){
            console.log("Authorization : No Access to this User.");
            return res.render("invalidRequest",{reason:"No Access to this Page."});
        }
        console.log("Authorization : Accessed.");
        return next();
    }
}

module.exports = { logTheRequest, invalidRequest,checkForAuthentication,restrictToRoles,errorLog,provideNewLine};
