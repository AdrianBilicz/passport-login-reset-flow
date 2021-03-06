const User = require('../models/User');
const promisify = require('es6-promisify');
exports.registerForm = (req,res,next) => {
	res.render('register', { title: 'Register' });
}
exports.validateRegister = (req,res,next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors()
  if(errors){
	  req.flash('error', errors.map(err => err.msg))
	  res.redirect('back')
	  return
  }
  next()
}
exports.register = async (req,res,next) => {
	const user = new User({email: req.body.email, name: req.body.name});
  const register = promisify(User.register, User)
  await register(user,req.body.password)
  next()
}
exports.account = (req,res,next) => {
  res.render('account', {title: 'Edit your account'})
}
exports.updateAccount = async (req,res,next) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  }
  const user = await User.findOneAndUpdate(
    {_id: req.user._id},
    {$set: updates},
    {new: true, runValidators: true, context: 'query'}
    );
  req.flash('success', 'Updated the profiel!');
  res.redirect('back')
}