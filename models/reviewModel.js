const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A Review Must Have review'],
      maxLength: [600, 'A Review Must Have review With Less Than 600 Characters'],
      minLength: [10, 'A Review Must Have review With At List 50 Characters']
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

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires'
  }).populate({
    path: 'tour'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tour) {
  const stats = await this.aggregate([
    {
      $match: {
        tour
      }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: {
          $sum: 1
        },
        averageRating: {
          $avg: 'rating'
        }
      }
    }
  ]);

  if (stats.length) {
    await Tour.findByIdAndUpdate(tour, {
      ratingsAverage: stats[0].averageRating,
      ratingsQuantity: stats[0].nRatings
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;