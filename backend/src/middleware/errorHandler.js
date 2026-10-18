/**
 * Global Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // Neo4j Specific constraint violations
  if (err.code && err.code.includes('ConstraintValidationFailed')) {
    return res.status(409).json({
      success: false,
      message: 'Integrity constraint violated: ' + err.message
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
