const nodemailer = require('nodemailer');

const sendEmail = (option) => {
    //create transporter
    const transporter = nodemailer.createTransport({
        host : process.env.EMAIL_HOST,
        port : process.env.EMAIL_PORT,
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from : "Wanderlust support<support@wanderlust.com>",
        to : option.email,
        subject : option.subject,
        text : option.message
    }
    transporter.sendMail(mailOptions);
};

module.exports = sendEmail;