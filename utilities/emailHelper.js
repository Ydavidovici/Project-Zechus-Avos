// utilities/emailHelper.js
const nodemailer = require('nodemailer');
require('dotenv').config();

function configureMailer() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',  // It's recommended to use environment variables here
            pass: 'your-password'
        }
    });
}

function sendEmail(transporter, to, subject, text) {
    const mailOptions = {
        from: 'your-email@gmail.com',  // Use environment variables or configuration files
        to: to,
        subject: subject,
        text: text
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.error('Error sending mail:', error);
                reject(error);
            } else {
                console.log('Email sent:', info.response);
                resolve(info);
            }
        });
    });
}

module.exports = {
    configureMailer,
    sendEmail
};
