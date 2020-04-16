const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A Review Must Have review'],
      maxLength: [600, 'A Review Must Have review With Less Than 600 Characters'],
      minLength: [50, 'A Review Must Have review With At List 50 Characters']
    },
    rating: {
      type : Number,
      default: 0,
      min: [1, 'A Review Must Have rating Equal Or Greater Than 1.0'],
      max: [5, 'A Review Must Have rating Equal Or Smaller Than 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A Review Must Have tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Review Must Have user']
    }
  },
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;