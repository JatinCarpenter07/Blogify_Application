const express=require('express');
const userRouter=express.Router();
const {userSignUp,userLogIn, userLogout}=require('../controllers/user');
const { render } = require('ejs');

userRouter.get('/signup', (req,res)=>res.render("signup"));
userRouter.post('/signup', userSignUp);
userRouter.get('/login', (req,res)=>res.render("login"));
userRouter.post('/login', userLogIn);
userRouter.get('/logout',userLogout);


module.exports=userRouter;