const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  next();
};

module.exports = logger;
