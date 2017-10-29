var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController')
var authController = require('../controllers/authController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', userController.registerForm);
router.get('/logout', authController.logout);

router.post('/register',
	userController.validateRegister,
	userController.register,
	authController.login
);
router.post('/login', authController.login);

router.get('/account',userController.account)
router.post('/account',userController.updateAccount)

router.post('/account/forgot', authController.forgot)
router.get('/account/reset/:token',authController.reset)
router.post('/account/reset/:token',
	authController.confirmedPassword,
	authController.update
)
module.exports = router;
