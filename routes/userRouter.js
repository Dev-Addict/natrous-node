const express = require('express');
const multer = require('multer');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const upload = multer({dest: 'public/img/users'});

const router = express.Router();

router
  .route('/signup')
  .post(authController.signUp);

router
  .route('/signin')
  .post(authController.signIn);

router
  .route('/logout')
  .get(authController.logOut);

router
  .route('/forgotPassword')
  .post(authController.forgotPassword);

router
  .route('/resetPassword/:resetToken')
  .patch(authController.resetPassword);

router.use(authController.protect);

router
  .route('/updatePassword')
  .patch(authController.updatePassword);

router
  .route('/updateUser')
  .patch(upload.single('photo'), authController.updateUser);

router
  .route('/deleteUser')
  .delete(authController.deleteUser);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/currentUser')
  .get(
    authController.protect,
    authController.getCurrentUser,
    userController.getUser
  );

module.exports = router;