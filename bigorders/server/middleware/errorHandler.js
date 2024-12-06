const errorHandler = (err, req, res, next) => {
  // Log detailed error for debugging
  console.error('\n=== ERROR HANDLER ===');
  console.error('1. Error Details:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code
  });

  console.error('2. Request Details:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    }
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    console.error('3. Validation Error:', err.errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.code === 11000) {
    console.error('3. Duplicate Key Error');
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  if (err.name === 'CastError') {
    console.error('3. Cast Error:', err);
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    console.error('3. JWT Error:', err);
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    console.error('3. Token Expired');
    return res.status(401).json({
      success: false,
      message: 'Authentication token expired'
    });
  }

  // Set appropriate status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`4. Response Status: ${statusCode}`);

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

module.exports = errorHandler;
