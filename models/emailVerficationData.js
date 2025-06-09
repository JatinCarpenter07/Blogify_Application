const mongoose=require('mongoose');

const emailVerificationDataSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
    },
    expireTime:{
        type:Date
    },
    verified: {
        type: String,
        enum: ['no', 'yes'],
        default: 'no'
    },
}, {
    timestamps: true,
    strict: false
});

const emailVerificationDataModel=mongoose.model("emailVerificationData",emailVerificationDataSchema,"emailVerificationData");

module.exports=emailVerificationDataModel;