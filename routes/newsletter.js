const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const subscribeRouter = express.Router();

subscribeRouter.use(bodyParser.json());

subscribeRouter.post('/', async (req, res) => {
  const { subject, htmlContent, email } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465
    auth: {
      user: "dsfardin606@gmail.com",
      pass: "mmci qyfw zkny mnmt",
    },
  });

  const mailOptions = {
    from: '"Maddison Fuck Much 👻" <dsfardin606@gmail.com>', // sender address
    to: email, // list of receivers
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Newsletter sent successfully');
    res.status(200).send('Newsletter sent successfully');
  } catch (error) {
    console.error('Failed to send newsletter:', error);
    res.status(500).send('Failed to send newsletter');
  }
});

module.exports = subscribeRouter;
