const nodemailer = require('nodemailer');
const { SMTP } = require('../config/Constants');

const transporter = nodemailer.createTransport({
  host: SMTP.HOST,
  port: SMTP.PORT,
  secure: SMTP.SECURE,
  auth: {
    user: SMTP.AUTH.USER,
    pass: SMTP.AUTH.PASS
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP connection error:', err);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});


async function send({ to, subject, text, html }) {
  const msg = {
    from: SMTP.FROM,
    to,
    subject,
    text,
    ...(html && { html })
  };
  return transporter.sendMail(msg);
}

module.exports = { send };
