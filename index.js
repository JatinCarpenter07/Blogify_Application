const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const cookieParser=require('cookie-parser');
const userRouter = require('./routes/user');
const { checkForAuthentication } = require('./middlewares');
const blogRouter = require('./routes/blog');
const homeRouter = require('./routes/home');

const app =express();
const port=5600;

mongoose.connect("mongodb://127.0.0.1:27017/blogifyDB").then(()=>console.log("DB Connected")).catch((error)=>{console.log(`error : ${error}`)});

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(checkForAuthentication);

app.use("/user",userRouter);
app.use("/blog",blogRouter);
app.use("/",homeRouter)




app.listen(port,"0.0.0.0",()=>{
    console.log(`Server is running on http://0.0.0.0:${port}`);
})