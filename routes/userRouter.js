const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router
  .route('/signup')
  .post(authController.signUp);

router
  .route('/signin')
  .post(authController.signIn);

router
  .route('/forgotPassword')
  .post(authController.forgotPassword);

router
  .route('/resetPassword/:resetToken')
  .patch(authController.resetPassword);

router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

router
  .route('/updateUser')
  .patch(authController.protect, authController.updateUser);

router
  .route('/deleteUser')
  .delete(authController.protect, authController.deleteUser);

router
  .route('/')
  .get(authController.protect, userController.getUsers)
  .post(authController.protect, userController.createUser);
router
  .route('/:id')
  .get(authController.protect, userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser);

module.exports = router;