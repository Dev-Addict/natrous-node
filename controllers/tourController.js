exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      requestTime: req.requestTime,
      message: 'the request body doesn\'t have required params(title or price)'
    });
  }
  next();
};

exports.getTours = (req, res) => {
};

exports.getTour = (req, res) => {
};

exports.createTour = (req, res) => {
};

exports.updateTour = (req, res) => {
};

exports.deleteTour = (req, res) => {
};