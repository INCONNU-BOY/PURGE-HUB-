import nodemailer  from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL ,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = async (to,otp) => {
   await transporter.sendMail({
        from:`${ process.env.EMAIL}`,
        to,
        subject: "Reset Your Password",
        html: `<p>Your OTP For Password Reset IS <b>${otp}</b>. It Expires In 5 Minutes </p>`,
    })
}

export default sendMail;
