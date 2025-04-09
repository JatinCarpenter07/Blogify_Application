const express=require('express');
const provideHomePage = require('../controllers/home');
const homeRouter=express.Router();

homeRouter.get('/',provideHomePage);

module.exports=homeRouter;

