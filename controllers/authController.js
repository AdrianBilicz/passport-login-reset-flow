const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = require('../models/User')
const promisify = require('es6-promisify');
const mail = require('../handlers/mail')
exports.login = passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlassh: 'Failed Login!',
		successRedirect: '/',
		successFlash: 'You are now logged in!'
	})
exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
}
exports.isLoggedIn = (req,res,next) => {
	if(req.isAuthenticated()){
		next()
		return;
	}
	req.flash('error', 'Oops you must be logged in to do that!')
	req.redirect('/login')
}
exports.forgot = async (req,res) => {
	const user = await User.findOne({email: req.body.email});
	if(!user){
		req.flash('error', 'No account with that email exist')
		return res.redirect('/login')		
	}
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
	user.resetPasswordExpires = Date.now() + 36000000
	await user.save()

	const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
	mail.send({
		user,
		subject: 'Password Reset',
		resetUrl,
		filename: 'password-reset'
	})
	req.flash('success',`You have been emailed a password reset link.`)
	res.redirect('/')
}
exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	})
	if(!user){
		req.flash('error', 'Password reset is invalid or has expired' )
		return res.redirect('/')
	}
	res.render('reset', {title: 'Reset your Password'})
}
exports.confirmedPassword = (req,res,next) => {
	req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);
	const error = req.validationErrors()
	if(error){
		req.flash('error', error[0].msg)
		res.redirect('back')
		return;
	}
	next()
}
exports.update = async (req,res,next) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	})
	if(!user){
		req.flash('error', 'Password reset is invalid or has expired' )
		return res.redirect('/')
	}
	const setPassword = promisify(user.setPassword, user)
	await setPassword(req.body.password)
	user.resetPasswordExpires = undefined;
	user.resetPasswordToken = undefined;
	const updatedUser = await user.save()
	console.log('ttt')
	await req.login(updatedUser)
 	req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
  	res.redirect('/');
}