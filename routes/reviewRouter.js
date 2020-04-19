const express = require('express');

const reviewController = require('../controllers/reviewController');

const router = express.Router(
  {
    mergeParams: true
  }
);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    reviewController.setInitialData,
    reviewController.createReview);
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;