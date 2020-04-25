const nodeMailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `natrous <${process.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodeMailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          password: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const htmlTemplate = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      name: this.name,
      url: this.url,
      subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: htmlTemplate,
      text: htmlToText.fromString(htmlTemplate)
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to natrous Family!');
  }

  async sendPasswordReset() {
    await this.send('resetPassword', 'Your password reset token(valid for 10 min)');
  }
};