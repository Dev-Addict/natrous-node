const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour Must Have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A Tour Must Have a name With Less Than 40 Characters'],
      minLength: [10, 'A Tour Must Have a name With At List 10 Characters']
    },
    duration: {
      type: Number,
      required: [true, 'A Tour Must Have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must Have a maxGroupSize']
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour Must Have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A Tour Must Have difficulty Value Set To easy Or medium Or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'A Tour Must Have ratingsAverage Equal Or Greater Than 1.0'],
      max: [5, 'A Tour Must Have ratingsAverage Equal Or Smaller Than 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A Tour Must Have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          return val < this.price && val > 0;
        },
        message: 'A Tour Must Have price Equal Or Greater Than 0 Or Smaller Than price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Tour Must Have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour Must Have a imageCover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: 'String',
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({
  price: 1,
  ratingsAverage: -1
});

tourSchema.index({
  startLocation: '2dsphere'
});

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  console.log('we are creating a new Tour with details of' + this);
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log('a tour with ' + doc + 'created');
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires'
  });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({
    $match: {
      $secretTour: { $ne: true }
    }
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;