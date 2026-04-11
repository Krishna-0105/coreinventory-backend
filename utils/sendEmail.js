import nodemailer from "nodemailer"

const sendEmail = async (to, subject, text) => {
  try {
    console.log("sendEmail function triggered")
    console.log("EMAIL_USER:", process.env.EMAIL_USER)
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing")

    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    })

    console.log("Email sent:", info.response)

  } catch (error) {
    console.log("EMAIL ERROR:", error)
  }
}

export default sendEmail