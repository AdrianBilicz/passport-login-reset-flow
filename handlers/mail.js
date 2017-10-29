const sgMail = require('@sendgrid/mail');
const promisify = require('es6-promisify');
const pug = require('pug')
const juice = require('juice')
const htmlToText = require('html-to-text')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateHTML = (filename,options = {}) => {
	const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`,options)
	const inlined = juice(html)
	return inlined
}

exports.send = async (options) => {
	const html = generateHTML(options.filename, options)
	const text = htmlToText.fromString(html)
	const mailOptions = {
		to: options.user.email,
		from: 'noreply@password_reset',
		subject: options.subject,
		text,
		html
	}
	const sendMail = promisify(sgMail.send,sgMail)
	return sendMail(mailOptions)
}
