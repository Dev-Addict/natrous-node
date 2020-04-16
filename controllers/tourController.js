const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  next();
};

exports.getTours = catchAsync(
  async (req, res) => {
    const features =
      new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      page: features.queryString.page * 1 || 1,
      limit: features.queryString.limit * 1 || 20,
      data: {
        tours
      }
    });
  }
);

exports.getTour = catchAsync(
  async (req, res) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
      throw new AppError('No tour found with this ID', 404);
    }
    res.status(201).json({
      status: 'success',
      data: {
        tour
      }
    });
  }
);

exports.createTour = catchAsync(
  async (req, res) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  }
);

exports.updateTour = catchAsync(
  async (req, res) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: 'updated Tour'
      }
    });
  }
);

exports.deleteTour = catchAsync(
  async (req, res) => {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

exports.getTourStats = catchAsync(
  async (req, res) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res) => {
    const year = req.params.year * 1;
    const plan = Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          tourStartCount: { $sum: 1 },
          tours: { $push: '$_id' }
        }
      },
      {
        $addField: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { tourStartCount: -1 }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  }
);