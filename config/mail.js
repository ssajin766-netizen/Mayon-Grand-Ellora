const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
 host:'smtp.gmail.com',
 port:465,
 secure:true,
 auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS},
 logger:true,
 debug:true
});
transporter.verify(err=>{if(err)console.error(err);else console.log('MAIL SERVER READY');});
module.exports=transporter;
