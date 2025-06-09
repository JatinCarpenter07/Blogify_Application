const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => {
    return (Math.floor(100000 + Math.random() * 900000)).toString(); // 6-digit OTP
};

const sendOTP = async(email, otp) => {
    const mailOptions = {
        from: `"Blogify" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP for Blogify',
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.Don't share with any one.</p>`
    };

    await transporter.sendMail(mailOptions);
}

module.exports={
    generateOTP,
    sendOTP
}