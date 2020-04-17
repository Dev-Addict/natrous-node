const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getTours);
router
  .route('/tour-stats')
  .get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);
router
  .route('/:id')
  .get(authController.protect, tourController.getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('users'),
    reviewController.createTour
  );

module.exports = router;